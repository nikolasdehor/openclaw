#!/usr/bin/env node
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const GROUP_JID = '120363152934505042@g.us';
const STATE_FILE = '/data/.openclaw/workspace/memory/for6devs-sentinel-state.json';

// Cooldown: minimum minutes between auto-replies (unless clear actionable context).
const COOLDOWN_MIN = 1;
// Max age: don't respond to messages older than this (minutes).
const MAX_AGE_MIN = 15;

// Known sender JIDs (best-effort) to prioritize.
// Jongas / João Pedro has shown up as these @lid variants.
const JONGAS_JIDS = new Set([
  '145479149031470@lid',
  '145479149031470:41@lid',
  '145479149031470:42@lid',
]);

// Nikolas in group can appear as rotating @lid variants (:33, :34...).
// Match by stable base id to avoid needing manual updates every time.
const NIKOLAS_BASE_ID = '89163739189254';

function isNikolasJid(jid) {
  const s = (jid || '').toString();
  return s.startsWith(`${NIKOLAS_BASE_ID}@lid`) || s.startsWith(`${NIKOLAS_BASE_ID}:`);
}

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
    contacts: {},
    transcripts: {},
    version: 2,
  };
}

function normalizeState(raw) {
  if (!raw || typeof raw !== 'object') return initState();
  return {
    lastSeenTs: raw.lastSeenTs || nowIsoUtc(),
    lastRespondedAt: raw.lastRespondedAt || null,
    contacts: raw.contacts && typeof raw.contacts === 'object' ? raw.contacts : {},
    transcripts: raw.transcripts && typeof raw.transcripts === 'object' ? raw.transcripts : {},
    version: 2,
  };
}

function runWacliList({ after, limit = 40 }) {
  const args = ['--timeout', '20s', 'messages', 'list', '--chat', GROUP_JID, '--after', after, '--limit', String(limit), '--json'];
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const out = execFileSync('wacli', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      if (!out || !out.trim()) throw new Error('empty');
      return { ok: true, json: JSON.parse(out) };
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
    const outFile = '/data/.openclaw/workspace/tmp/whisper-out.txt';
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    execFileSync(
      '/usr/local/lib/node_modules/openclaw/skills/openai-whisper-api/scripts/transcribe.sh',
      [filePath, '--language', 'pt', '--out', outFile],
      { stdio: ['ignore', 'ignore', 'ignore'], timeout: 120000, env: { ...process.env } }
    );
    const text = fs.readFileSync(outFile, 'utf8');
    return (text || '').replace(/\s+/g, ' ').trim();
  } catch {
    return null;
  }
}

function isDirectMention(t) {
  return /(dehor|devinho|bot)\b/i.test((t || '').trim());
}

function isQuestionOrRequest(t) {
  const s = (t || '').trim().toLowerCase();
  if (!s) return false;
  if (s.includes('?')) return true;
  // common group requests even without '?'
  return (
    s.startsWith('vale a pena') ||
    s.startsWith('compensa') ||
    s.startsWith('como ') ||
    s.includes('como faz') ||
    s.includes('tem como') ||
    s.includes('consegue') ||
    s.includes('conseguem') ||
    s.includes('me ajuda') ||
    s.includes('ajuda') ||
    s.includes('alguém sabe') ||
    s.includes('alguem sabe') ||
    s.includes('dúvida') ||
    s.includes('duvida') ||
    s.includes('preciso de')
  );
}

function isTrivialAck(t) {
  const s = (t || '').trim().toLowerCase();
  if (!s) return true;
  return [
    'ok', 'blz', 'beleza', 'show', 'top', 'boa', 'valeu', 'tmj', 'kkk', 'haha', 'hahaha',
    'pode ser', 'fechou', 'entendi', 'sim', 'não', 'nao', 'de boa'
  ].includes(s);
}

// DEHOR_JIDS: messages sent by dehor itself (FromMe=true already filters these,
// but also filter by JID in case of edge cases).
const DEHOR_JIDS = new Set([
  '556298561249@s.whatsapp.net',
  '556298561249:10@s.whatsapp.net',
  '251844634894449:10@lid',
  '251844634894449@lid',
]);

function main() {
  const raw = safeReadJson(STATE_FILE);
  let state = normalizeState(raw);

  if (!raw) {
    writeJson(STATE_FILE, state);
    process.stdout.write('NOSEND\n');
    return;
  }

  const hasMention = { value: false };

  // Check cooldown
  const cooldownOk = minutesAgo(state.lastRespondedAt) >= COOLDOWN_MIN;

  // Fetch new messages since last check
  const after = state.lastSeenTs || nowIsoUtc();
  const res = runWacliList({ after, limit: 40 });
  if (!res.ok) {
    process.stdout.write('NOSEND\n');
    return;
  }

  const messages = (((res.json || {}).data || {}).messages) || [];
  if (!Array.isArray(messages) || messages.length === 0) {
    process.stdout.write('NOSEND\n');
    return;
  }

  // Update lastSeenTs to the newest message
  let maxTs = null;
  for (const m of messages) {
    if (m && m.Timestamp && (!maxTs || m.Timestamp > maxTs)) maxTs = m.Timestamp;
  }
  if (maxTs) state.lastSeenTs = maxTs;

  // Filter to incoming (not from dehor)
  const incoming = messages
    .filter(m => m && m.FromMe === false && !DEHOR_JIDS.has(m.SenderJID || ''))
    .map(m => {
      const text = (m.Text || '').trim();
      if (isDirectMention(text)) hasMention.value = true;
      return {
        id: m.MsgID,
        ts: m.Timestamp,
        senderJid: m.SenderJID || null,
        mediaType: (m.MediaType || '').toLowerCase() || null,
        text,
      };
    })
    .sort((a, b) => (a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : 0));

  if (incoming.length === 0) {
    writeJson(STATE_FILE, state);
    process.stdout.write('NOSEND\n');
    return;
  }

  // Check if the latest incoming message is too old
  const latestIncoming = incoming[incoming.length - 1];
  const latestAge = minutesAgo(latestIncoming.ts);

  // For direct mentions, be more lenient with age (30 min)
  const ageLimit = hasMention.value ? 30 : MAX_AGE_MIN;
  if (latestAge > ageLimit) {
    writeJson(STATE_FILE, state);
    process.stdout.write('NOSEND\n');
    return;
  }

  // Decide if we should reply at all (deterministic, anti-spam):
  // reply if there's a direct mention, a clear question/request, or a media item with caption.
  const shouldReply = incoming.some(m => {
    if (!m) return false;
    if (hasMention.value) return true;
    if (isQuestionOrRequest(m.text)) return true;
    if (m.mediaType === 'document' && (m.text || '').trim()) return true;
    if (m.mediaType === 'audio') return true;
    // Intelligent participation for everyone: engage on meaningful non-trivial text.
    if ((m.text || '').trim() && !isTrivialAck(m.text)) return true;
    return false;
  });

  // Cooldown check (skip if direct mention OR Nikolas message)
  const hasClearQuestion = incoming.some(m => isQuestionOrRequest(m.text));
  const hasMeaningfulText = incoming.some(m => (m.text || '').trim() && !isTrivialAck(m.text));
  if (!cooldownOk && !hasMention.value && !hasClearQuestion && !hasMeaningfulText) {
    writeJson(STATE_FILE, state);
    process.stdout.write('NOSEND\n');
    return;
  }

  if (!shouldReply) {
    // Persist lastSeenTs but do not burn cooldown on non-actionable chatter.
    writeJson(STATE_FILE, state);
    process.stdout.write('NOSEND\n');
    return;
  }

  // Transcribe audio messages (best-effort) only when we intend to reply.
  for (const m of incoming) {
    if (m.mediaType === 'audio' && m.id) {
      const key = `${m.id}`;
      if (state.transcripts && state.transcripts[key]) {
        m.transcript = state.transcripts[key];
      } else {
        const outDir = '/data/.openclaw/workspace/tmp/wa-media';
        fs.mkdirSync(outDir, { recursive: true });
        const { res: dl, killedPid } = maybeUnlockStoreAndRetry(() => runWacliMediaDownload({ id: m.id, outDir }));
        if (killedPid) restartWacliSyncFollow();
        if (dl.ok && dl.path) {
          const t = transcribeAudioFile(dl.path);
          if (t) {
            const transcript = t.length > 500 ? t.slice(0, 497) + '...' : t;
            m.transcript = transcript;
            state.transcripts[key] = transcript;
          }
        }
      }
    }
  }

  // Build full context: latest 40 messages from group
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

  // Enrich incoming with sender names
  const newMessages = incoming.map(m => ({
    msgId: m.id,
    ts: m.ts,
    senderJid: m.senderJid,
    senderName: senderNameFor(state, m.senderJid) || null,
    mediaType: m.mediaType,
    text: m.text,
    transcript: m.transcript || null,
  }));

  // Mark as responded (we only reach here if we intend to reply)
  state.lastRespondedAt = nowIsoUtc();

  // Persist state
  writeJson(STATE_FILE, state);

  process.stdout.write('SEND\n');
  process.stdout.write(
    JSON.stringify(
      {
        newMessages,
        hasDirectMention: hasMention.value,
        context,
      },
      null,
      2
    ) + '\n'
  );
}

main();
