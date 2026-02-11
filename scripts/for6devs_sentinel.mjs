#!/usr/bin/env node
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const GROUP_JID = '120363152934505042@g.us';
const STATE_FILE = '/Users/nikolas/.openclaw/workspace/memory/for6devs-sentinel-state.json';

function nowIsoUtc() {
  return new Date().toISOString();
}

function minutesAgo(iso) {
  if (!iso) return Infinity;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return Infinity;
  return (Date.now() - t) / 60000;
}

function safeReadJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function initState() {
  return {
    lastSeenTs: nowIsoUtc(),
    lastRespondedAt: null,
    lastRespondedMsgId: null,
    contacts: {},
    transcripts: {},
    version: 1,
  };
}

function normalizeState(raw) {
  if (!raw || typeof raw !== 'object') return initState();
  return {
    lastSeenTs: raw.lastSeenTs || nowIsoUtc(),
    lastRespondedAt: raw.lastRespondedAt || null,
    lastRespondedMsgId: raw.lastRespondedMsgId || null,
    contacts: raw.contacts && typeof raw.contacts === 'object' ? raw.contacts : {},
    transcripts: raw.transcripts && typeof raw.transcripts === 'object' ? raw.transcripts : {},
    version: 1,
  };
}

function runWacliList({ after, limit = 30 }) {
  const args = ['--timeout', '20s', 'messages', 'list', '--chat', GROUP_JID, '--after', after, '--limit', String(limit), '--json'];
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const out = execFileSync('wacli', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      if (!out || !out.trim()) throw new Error('empty');
      const parsed = JSON.parse(out);
      return { ok: true, json: parsed };
    } catch (e) {
      if (attempt === 1) {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 600);
        continue;
      }
      const stdout = e && e.stdout ? e.stdout.toString('utf8') : '';
      const stderr = e && e.stderr ? e.stderr.toString('utf8') : '';
      return { ok: false, error: (stdout || stderr || e.message || String(e)).trim() };
    }
  }
  return { ok: false, error: 'unknown' };
}

function runWacliContactName(jid) {
  try {
    const out = execFileSync('wacli', ['--timeout', '8s', 'contacts', 'show', '--jid', jid, '--json'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    if (!out || !out.trim()) return null;
    const parsed = JSON.parse(out);
    const c = (parsed && parsed.data) || null;
    if (!c) return null;
    return (c.Alias || c.Name || c.Phone || '').toString().trim() || null;
  } catch {
    return null;
  }
}

function senderNameFor(state, jid) {
  if (!jid) return null;
  if (state.contacts && state.contacts[jid]) return state.contacts[jid];
  const name = runWacliContactName(jid);
  if (name) {
    state.contacts[jid] = name;
    return name;
  }
  return null;
}

function runWacliMediaDownload({ id, outDir }) {
  try {
    const out = execFileSync(
      'wacli',
      ['--timeout', '60s', 'media', 'download', '--chat', GROUP_JID, '--id', id, '--output', outDir, '--json'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    );
    const parsed = JSON.parse(out);
    if (parsed && parsed.success && parsed.data && parsed.data.path) return { ok: true, path: parsed.data.path };
    return { ok: false, error: JSON.stringify(parsed) };
  } catch (e) {
    const stdout = e && e.stdout ? e.stdout.toString('utf8') : '';
    const stderr = e && e.stderr ? e.stderr.toString('utf8') : '';
    return { ok: false, error: (stdout || stderr || e.message || String(e)).trim() };
  }
}

function maybeUnlockStoreAndRetry(fn) {
  let killedPid = null;
  let res = fn();
  if (res.ok) return { res, killedPid };
  const m = String(res.error || '').match(/pid=(\d+)/);
  if (m) {
    const pid = Number(m[1]);
    if (Number.isFinite(pid) && pid > 0) {
      try {
        process.kill(pid, 'SIGINT');
        killedPid = pid;
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1200);
      } catch {
        // ignore
      }
      res = fn();
    }
  }
  return { res, killedPid };
}

function restartWacliSyncFollow() {
  try {
    const child = spawn('wacli', ['sync', '--follow', '--refresh-contacts', '--refresh-groups'], {
      detached: true,
      stdio: 'ignore',
    });
    child.unref();
  } catch {
    // ignore
  }
}

function transcribeAudioFile(filePath) {
  try {
    const outDir = '/Users/nikolas/.openclaw/workspace/tmp/whisper';
    fs.mkdirSync(outDir, { recursive: true });
    execFileSync(
      'whisper',
      [filePath, '--language', 'pt', '--task', 'transcribe', '--model', 'turbo', '--output_format', 'txt', '--output_dir', outDir, '--verbose', 'False'],
      { stdio: ['ignore', 'ignore', 'ignore'], timeout: 120000 }
    );
    const base = path.basename(filePath).replace(/\.[^.]+$/, '');
    const txtPath = path.join(outDir, `${base}.txt`);
    const text = fs.readFileSync(txtPath, 'utf8');
    return (text || '').replace(/\s+/g, ' ').trim();
  } catch {
    return null;
  }
}

const OWNER_JIDS = new Set([
  // Nikolas (owner) variants
  '556286077431@s.whatsapp.net',
  '556286077431:33@s.whatsapp.net',
  '89163739189254@lid',
  '89163739189254:33@lid',
]);

function isDirectMention(t) {
  return /(dehor|devinho|bot)\b/i.test((t || '').trim());
}

function isQuestionText(t) {
  const s = (t || '').trim();
  if (!s) return false;
  const lower = s.toLowerCase();

  // Strong signals.
  if (s.includes('?')) return true;
  if (isDirectMention(s)) return true;

  // Weak signals (only if message starts like a question).
  if (/^(como|qual|quando|onde|pq|por que|que horas|algu[eé]m|ajuda|erro|bug)\b/.test(lower)) return true;

  return false;
}

function main() {
  const raw = safeReadJson(STATE_FILE);
  let state = normalizeState(raw);

  if (!raw) {
    writeJson(STATE_FILE, state);
    process.stdout.write('NOSEND\n');
    return;
  }

  // Anti-flood: one reply per 10 minutes unless direct mention.
  const allowAny = minutesAgo(state.lastRespondedAt) >= 10;

  const after = state.lastSeenTs || nowIsoUtc();
  const res = runWacliList({ after, limit: 40 });
  if (!res.ok) {
    // don't send anything; just keep state as-is
    process.stdout.write('NOSEND\n');
    return;
  }

  const messages = (((res.json || {}).data || {}).messages) || [];
  if (!Array.isArray(messages) || messages.length === 0) {
    process.stdout.write('NOSEND\n');
    return;
  }

  // Update lastSeenTs
  let maxTs = null;
  for (const m of messages) {
    if (m && m.Timestamp && (!maxTs || m.Timestamp > maxTs)) maxTs = m.Timestamp;
  }
  if (maxTs) state.lastSeenTs = maxTs;

  const incoming = messages
    .filter(m => m && m.FromMe === false)
    .map(m => ({
      id: m.MsgID,
      ts: m.Timestamp,
      senderJid: m.SenderJID || null,
      mediaType: (m.MediaType || '').toLowerCase() || null,
      text: (m.Text || '').trim(),
    }))
    .sort((a, b) => (a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : 0));

  if (incoming.length === 0) {
    writeJson(STATE_FILE, state);
    process.stdout.write('NOSEND\n');
    return;
  }

  // Build full context for the LLM: latest 40 messages
  const ctxRes = runWacliList({ after: '1970-01-01T00:00:00Z', limit: 40 });
  const ctxMsgs = (ctxRes.ok ? (((ctxRes.json || {}).data || {}).messages) : []) || [];
  const context = ctxMsgs
    .slice(0, 40)
    .map(m => ({
      ts: m.Timestamp,
      fromMe: !!m.FromMe,
      senderJid: m.SenderJID || null,
      senderName: m.FromMe ? 'dehor' : (senderNameFor(state, m.SenderJID) || null),
      mediaType: (m.MediaType || '').toLowerCase() || null,
      text: (m.Text || '').trim(),
      msgId: m.MsgID || null,
    }))
    .reverse();

  // Candidate: latest incoming message that looks like a question/help.
  let candidate = null;
  for (let i = incoming.length - 1; i >= 0; i--) {
    const m = incoming[i];
    const isAudio = m.mediaType === 'audio';

    // Don't auto-reply to the owner in the group (unless direct mention).
    if (m.senderJid && OWNER_JIDS.has(m.senderJid) && !isDirectMention(m.text)) continue;

    if (!m.text && !isAudio) continue;

    // For audio, we'll only consider it a candidate after transcription (later) and if it looks like a question.
    if (isAudio) {
      candidate = m;
      break;
    }

    if (isQuestionText(m.text)) {
      candidate = m;
      break;
    }
  }

  if (!candidate) {
    writeJson(STATE_FILE, state);
    process.stdout.write('NOSEND\n');
    return;
  }

  const lastIncoming = incoming[incoming.length - 1];

  // Don't jump in if the conversation already moved past the candidate (unless direct mention).
  const directMention = isDirectMention(candidate.text);
  if (lastIncoming && candidate.id && lastIncoming.id && candidate.id !== lastIncoming.id && !directMention) {
    writeJson(STATE_FILE, state);
    process.stdout.write('NOSEND\n');
    return;
  }

  // If we're within cool-down and it's not a direct mention, skip.
  if (!allowAny && !directMention) {
    writeJson(STATE_FILE, state);
    process.stdout.write('NOSEND\n');
    return;
  }

  // If candidate is old (>8 min), avoid late replies.
  if (minutesAgo(candidate.ts) > 8) {
    writeJson(STATE_FILE, state);
    process.stdout.write('NOSEND\n');
    return;
  }

  // Best-effort transcript for audio candidates.
  let transcript = null;
  if (candidate.mediaType === 'audio') {
    const key = `${candidate.id}`;
    if (state.transcripts && state.transcripts[key]) {
      transcript = state.transcripts[key];
    } else if (candidate.id) {
      const outDir = '/Users/nikolas/.openclaw/workspace/tmp/wa-media';
      fs.mkdirSync(outDir, { recursive: true });
      const { res: dl, killedPid } = maybeUnlockStoreAndRetry(() => runWacliMediaDownload({ id: candidate.id, outDir }));
      if (killedPid) restartWacliSyncFollow();
      if (dl.ok && dl.path) {
        const t = transcribeAudioFile(dl.path);
        if (t) {
          transcript = t.length > 500 ? t.slice(0, 497) + '...' : t;
          state.transcripts[key] = transcript;
        }
      }
    }

    // If audio transcript doesn't look like a question/help, skip.
    if (!isQuestionText(transcript || '')) {
      writeJson(STATE_FILE, state);
      process.stdout.write('NOSEND\n');
      return;
    }
  }

  // Mark as responded now (best-effort throttle; assumes the cron will send after we say SEND)
  state.lastRespondedAt = nowIsoUtc();
  state.lastRespondedMsgId = candidate.id || null;

  // Persist state (seen ts + caches)
  writeJson(STATE_FILE, state);

  process.stdout.write('SEND\n');
  process.stdout.write(
    JSON.stringify(
      {
        candidate: {
          msgId: candidate.id,
          ts: candidate.ts,
          senderJid: candidate.senderJid,
          senderName: senderNameFor(state, candidate.senderJid) || null,
          mediaType: candidate.mediaType,
          text: candidate.text,
          transcript,
        },
        context,
      },
      null,
      2
    ) + '\n'
  );
}

main();
