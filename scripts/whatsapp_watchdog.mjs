#!/usr/bin/env node
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const STATE_FILE = '/Users/nikolas/.openclaw/workspace/memory/whatsapp-watch-state.json';

const JIDS = [
  '556285054199@s.whatsapp.net',
  '208799885434990@lid',
  '556293920369@s.whatsapp.net',
  '93115327246503@lid',
  '556299107824@s.whatsapp.net',
  '23454933864500@lid',
  '120363152934505042@g.us',
];

function labelForJid(jid) {
  switch (jid) {
    case '556285054199@s.whatsapp.net':
    case '208799885434990@lid':
      return 'Pai';
    case '556293920369@s.whatsapp.net':
    case '93115327246503@lid':
      return 'Mãe';
    case '556299107824@s.whatsapp.net':
    case '23454933864500@lid':
      return 'Laura';
    case '120363152934505042@g.us':
      return 'FOR6DEVS';
    default:
      return 'WhatsApp';
  }
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
    const s = fs.readFileSync(p, 'utf8');
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function initState() {
  const now = nowIsoUtc();
  const lastSeenTs = {};
  const errorStreak = {};
  for (const jid of JIDS) {
    lastSeenTs[jid] = now;
    errorStreak[jid] = 0;
  }
  return { lastSeenTs, errorStreak, lastErrorNotifyAt: null, contacts: {}, transcripts: {}, version: 5 };
}

function normalizeState(raw) {
  if (!raw || typeof raw !== 'object') return initState();

  // Back-compat: if it's a direct map of jid->ts
  if (!raw.lastSeenTs && Object.keys(raw).some(k => k.includes('@'))) {
    raw = { lastSeenTs: raw };
  }

  const state = {
    lastSeenTs: raw.lastSeenTs && typeof raw.lastSeenTs === 'object' ? raw.lastSeenTs : {},
    errorStreak: raw.errorStreak && typeof raw.errorStreak === 'object' ? raw.errorStreak : {},
    lastErrorNotifyAt: raw.lastErrorNotifyAt || null,
    contacts: raw.contacts && typeof raw.contacts === 'object' ? raw.contacts : {},
    transcripts: raw.transcripts && typeof raw.transcripts === 'object' ? raw.transcripts : {},
    version: raw.version || 5,
  };

  const now = nowIsoUtc();
  for (const jid of JIDS) {
    if (!state.lastSeenTs[jid]) state.lastSeenTs[jid] = now;
    if (typeof state.errorStreak[jid] !== 'number') state.errorStreak[jid] = 0;
  }
  return state;
}

function runWacliList({ jid, after }) {
  // 1 retry if store busy / transient.
  const args = ['--timeout', '20s', 'messages', 'list', '--chat', jid, '--after', after, '--limit', '30', '--json'];
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const out = execFileSync('wacli', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
      if (!out || !out.trim()) throw new Error('empty');
      const parsed = JSON.parse(out);
      return { ok: true, json: parsed };
    } catch (e) {
      if (attempt === 1) {
        // tiny backoff
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 800);
        continue;
      }
      return { ok: false, error: String(e && e.message ? e.message : e) };
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

function runWacliMediaDownload({ chat, id, outDir }) {
  try {
    const out = execFileSync(
      'wacli',
      ['--timeout', '60s', 'media', 'download', '--chat', chat, '--id', id, '--output', outDir, '--json'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    );
    const parsed = JSON.parse(out);
    if (parsed && parsed.success && parsed.data && parsed.data.path) {
      return { ok: true, path: parsed.data.path };
    }
    return { ok: false, error: JSON.stringify(parsed) };
  } catch (e) {
    const stdout = e && e.stdout ? e.stdout.toString('utf8') : '';
    const stderr = e && e.stderr ? e.stderr.toString('utf8') : '';
    const msg = (stdout || stderr || (e && e.message) || '').trim();
    return { ok: false, error: msg || 'download failed' };
  }
}

function maybeUnlockStoreAndRetry(fn) {
  // If the store is locked by a long-running `wacli sync --follow`, interrupt it briefly.
  // This lets us download media (audio) and then we restart the sync.
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
        // wait a bit
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1500);
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
      [
        filePath,
        '--language',
        'pt',
        '--task',
        'transcribe',
        '--model',
        'turbo',
        '--output_format',
        'txt',
        '--output_dir',
        outDir,
        '--verbose',
        'False',
      ],
      {
        encoding: 'utf8',
        stdio: ['ignore', 'ignore', 'ignore'],
        timeout: 120000,
      }
    );

    const base = path.basename(filePath).replace(/\.[^.]+$/, '');
    const txtPath = path.join(outDir, `${base}.txt`);
    const text = fs.readFileSync(txtPath, 'utf8');
    return (text || '').replace(/\s+/g, ' ').trim();
  } catch {
    return null;
  }
}

function formatHmLocal(iso) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  } catch {
    return '';
  }
}

function toLine(m) {
  const text = (m.Text || '').replace(/\s+/g, ' ').trim();
  const media = (m.MediaType || '').toLowerCase();

  const placeholder = /^\[(audio|voice|vídeo|video|imagem|image|sticker|arquivo|file|document)\]$/i.test(text);

  let line = '';

  // Prefer media label when we have media and the "text" is empty or just a placeholder like "[Audio]".
  if (media && (!text || placeholder)) {
    if (media === 'audio' || media === 'ptt' || media === 'voice') line = '[Áudio]';
    else if (media === 'image') line = '[Imagem]';
    else if (media === 'video') line = '[Vídeo]';
    else if (media === 'document' || media === 'file') line = '[Arquivo]';
    else if (media === 'sticker') line = '[Sticker]';
    else line = '[Mídia]';
  } else if (text) {
    if (/^https?:\/\/\S+$/.test(text)) {
      try {
        const u = new URL(text);
        line = `link: ${u.hostname}`;
      } catch {
        line = 'link';
      }
    } else if (/^\[audio\]$/i.test(text)) {
      // wacli sometimes stores audio as text placeholder
      line = '[Áudio]';
    } else {
      line = text;
    }
  } else {
    line = '[Mídia]';
  }

  if (line.length > 140) line = line.slice(0, 137) + '...';
  return line;
}

function main() {
  const raw = safeReadJson(STATE_FILE);
  let state = normalizeState(raw);

  // First run: create state and do not send anything.
  if (!raw) {
    writeJson(STATE_FILE, state);
    process.stdout.write('NOSEND\n');
    return;
  }

  const seenMsgIds = new Set();
  /** @type {Record<string, {ts:string, line:string, senderJid?:string|null, isMedia?:boolean, msgId?:string|null, chatJid?:string|null, mediaType?:string|null}[]>} */
  const byLabel = {};

  let hadAnyHardError = false;

  for (const jid of JIDS) {
    const after = state.lastSeenTs[jid] || nowIsoUtc();
    const res = runWacliList({ jid, after });

    if (!res.ok) {
      hadAnyHardError = true;
      state.errorStreak[jid] = (state.errorStreak[jid] || 0) + 1;
      continue;
    }

    state.errorStreak[jid] = 0;

    const messages = (((res.json || {}).data || {}).messages) || [];
    if (!Array.isArray(messages) || messages.length === 0) {
      continue;
    }

    // update lastSeenTs to max Timestamp
    let maxTs = null;
    for (const m of messages) {
      if (m && m.Timestamp && (!maxTs || m.Timestamp > maxTs)) maxTs = m.Timestamp;
    }
    if (maxTs) state.lastSeenTs[jid] = maxTs;

    for (const m of messages) {
      if (!m || m.FromMe !== false) continue;
      const msgId = m.MsgID || `${jid}:${m.Timestamp}:${m.Text || m.MediaType || ''}`;
      if (seenMsgIds.has(msgId)) continue;
      seenMsgIds.add(msgId);

      const label = labelForJid(jid);
      if (!byLabel[label]) byLabel[label] = [];

      const media = (m.MediaType || '').toLowerCase();
      const text = (m.Text || '').trim();
      const isMedia = !!media || /^\[(audio|voice|vídeo|video|imagem|image|sticker|arquivo|file|document)\]$/i.test(text);

      byLabel[label].push({
        ts: m.Timestamp || nowIsoUtc(),
        line: toLine(m),
        senderJid: m.SenderJID || null,
        isMedia,
        msgId,
        chatJid: jid,
        mediaType: media || null,
      });
    }
  }

  // persist state
  writeJson(STATE_FILE, state);

  const labelsOrder = ['Pai', 'Mãe', 'Laura', 'FOR6DEVS'];
  const anyNew = labelsOrder.some(l => (byLabel[l] || []).length > 0);

  if (!anyNew) {
    // Error notifications are intentionally throttled to avoid spamming.
    // Only notify if a chat has been failing for ~1 hour (6 runs) and only once every 2 hours.
    const persistent = Object.values(state.errorStreak || {}).some(v => typeof v === 'number' && v >= 6);
    const canNotify = minutesAgo(state.lastErrorNotifyAt) >= 120;

    if (persistent && canNotify) {
      state.lastErrorNotifyAt = nowIsoUtc();
      writeJson(STATE_FILE, state);

      process.stdout.write('SEND\n');
      process.stdout.write('*WhatsApp (check)*\n');
      process.stdout.write('• Tô com erro persistente pra checar alguns chats (provável store ocupado). Vou continuar tentando automaticamente.\n');
      return;
    }

    process.stdout.write('NOSEND\n');
    return;
  }

  function shortSender(jid) {
    if (!jid) return '';
    const base = String(jid).split('@')[0].split(':')[0];
    const last4 = base.length > 4 ? base.slice(-4) : base;
    return `contato ${last4}`;
  }

  function senderNameFor(jid) {
    if (!jid) return null;
    if (state.contacts && state.contacts[jid]) return state.contacts[jid];
    const name = runWacliContactName(jid);
    if (name) {
      state.contacts[jid] = name;
      return name;
    }
    return null;
  }

  function getTranscriptForItem(item) {
    try {
      if (!item || item.mediaType !== 'audio') return null;
      const key = `${item.chatJid || ''}|${item.msgId || ''}`;
      if (state.transcripts && typeof state.transcripts[key] === 'string' && state.transcripts[key]) {
        return state.transcripts[key];
      }

      const outDir = '/Users/nikolas/.openclaw/workspace/tmp/wa-media';
      fs.mkdirSync(outDir, { recursive: true });

      const { res, killedPid } = maybeUnlockStoreAndRetry(() =>
        runWacliMediaDownload({ chat: item.chatJid, id: item.msgId, outDir })
      );

      if (killedPid) restartWacliSyncFollow();

      if (!res.ok || !res.path) return null;

      const transcript = transcribeAudioFile(res.path);
      if (!transcript) return null;

      const clean = transcript.replace(/\s+/g, ' ').trim();
      const short = clean.length > 220 ? clean.slice(0, 217) + '...' : clean;

      state.transcripts[key] = short;
      return short;
    } catch {
      return null;
    }
  }

  // Build message
  let out = '*WhatsApp (novas mensagens)*\n\n';
  for (const label of labelsOrder) {
    const items = (byLabel[label] || []).sort((a, b) => (a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : 0));
    if (items.length === 0) continue;

    out += `*${label}*\n`;

    const total = items.length;

    // Default: show last 3.
    const shownIdx = [];
    for (let i = Math.max(0, total - 3); i < total; i++) shownIdx.push(i);

    // Group tweak: if there is any media in the batch but the last 3 don't include it,
    // replace the oldest shown item with the most recent media item so it doesn't get hidden.
    if (label === 'FOR6DEVS' && total > 3) {
      const hasMediaInShown = shownIdx.some(i => items[i].isMedia);
      if (!hasMediaInShown) {
        let lastMedia = -1;
        for (let i = total - 1; i >= 0; i--) {
          if (items[i].isMedia) {
            lastMedia = i;
            break;
          }
        }
        if (lastMedia >= 0 && !shownIdx.includes(lastMedia)) {
          shownIdx[0] = lastMedia;
          shownIdx.sort((a, b) => a - b);
        }
      }
    }

    for (let pos = 0; pos < shownIdx.length; pos++) {
      const i = shownIdx[pos];
      let line = items[i].line;

      // Always transcribe audio (best-effort) so the alert is self-contained.
      if (items[i].mediaType === 'audio') {
        const tr = getTranscriptForItem(items[i]);
        line = tr ? `[Áudio] ${tr}` : '[Áudio]';
      }

      // Append count of hidden items on the final displayed bullet.
      if (pos === shownIdx.length - 1) {
        const hidden = total - shownIdx.length;
        if (hidden > 0) line = `${line} (+${hidden})`;
      }

      const hm = formatHmLocal(items[i].ts);
      let prefix = hm ? `${hm} ` : '';

      if (label === 'FOR6DEVS') {
        const jid = items[i].senderJid;
        const name = senderNameFor(jid) || shortSender(jid);
        if (name) prefix += `${name}: `;
      }

      out += `• ${prefix}${line}\n`;
    }
    out += '\n';
  }

  // Persist contact cache updates (if any)
  writeJson(STATE_FILE, state);

  process.stdout.write('SEND\n');
  process.stdout.write(out.trimEnd() + '\n');
}

main();
