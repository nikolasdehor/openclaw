#!/usr/bin/env node
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const STATE_FILE = '/data/.openclaw/workspace/memory/whatsapp-watch-state.json';

const JIDS = [
  '556285054199@s.whatsapp.net',
  '208799885434990@lid',
  '556293920369@s.whatsapp.net',
  '93115327246503@lid',
  '556299107824@s.whatsapp.net',
  '23454933864500@lid',
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
    default:
      return 'WhatsApp';
  }
}

function nowIsoUtc() { return new Date().toISOString(); }

function minutesAgo(iso) {
  if (!iso) return Infinity;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return Infinity;
  return (Date.now() - t) / 60000;
}

function safeReadJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function initState() {
  const now = nowIsoUtc();
  const lastSeenTs = {}, errorStreak = {};
  for (const jid of JIDS) { lastSeenTs[jid] = now; errorStreak[jid] = 0; }
  return { lastSeenTs, errorStreak, lastErrorNotifyAt: null, lastAuthNotifyAt: null, contacts: {}, transcripts: {}, version: 6 };
}

function normalizeState(raw) {
  if (!raw || typeof raw !== 'object') return initState();
  if (!raw.lastSeenTs && Object.keys(raw).some(k => k.includes('@'))) raw = { lastSeenTs: raw };
  const state = {
    lastSeenTs: raw.lastSeenTs && typeof raw.lastSeenTs === 'object' ? raw.lastSeenTs : {},
    errorStreak: raw.errorStreak && typeof raw.errorStreak === 'object' ? raw.errorStreak : {},
    lastErrorNotifyAt: raw.lastErrorNotifyAt || null,
    lastAuthNotifyAt: raw.lastAuthNotifyAt || null,
    contacts: raw.contacts && typeof raw.contacts === 'object' ? raw.contacts : {},
    transcripts: raw.transcripts && typeof raw.transcripts === 'object' ? raw.transcripts : {},
    version: raw.version || 6,
  };
  const now = nowIsoUtc();
  for (const jid of JIDS) {
    if (!state.lastSeenTs[jid]) state.lastSeenTs[jid] = now;
    if (typeof state.errorStreak[jid] !== 'number') state.errorStreak[jid] = 0;
  }
  return state;
}

function wacliAuthStatus() {
  try {
    const out = execFileSync('wacli', ['auth', 'status', '--json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const parsed = JSON.parse(out || '{}');
    return !!(parsed && parsed.success && parsed.data && parsed.data.authenticated);
  } catch { return false; }
}

function runWacliList({ jid, after }) {
  const args = ['--timeout', '20s', 'messages', 'list', '--chat', jid, '--after', after, '--limit', '30', '--json'];
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const out = execFileSync('wacli', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
      if (!out || !out.trim()) throw new Error('empty');
      return { ok: true, json: JSON.parse(out) };
    } catch (e) {
      if (attempt === 1) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 800); continue; }
      return { ok: false, error: String(e?.message || e) };
    }
  }
  return { ok: false, error: 'unknown' };
}

function runWacliContactName(jid) {
  try {
    const out = execFileSync('wacli', ['--timeout', '8s', 'contacts', 'show', '--jid', jid, '--json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    if (!out?.trim()) return null;
    const c = JSON.parse(out)?.data;
    return (c?.Alias || c?.Name || c?.Phone || '').toString().trim() || null;
  } catch { return null; }
}

function maybeUnlockStoreAndRetry(fn) {
  let killedPid = null, res = fn();
  if (res.ok) return { res, killedPid };
  const m = String(res.error || '').match(/pid=(\d+)/);
  if (m) {
    const pid = Number(m[1]);
    if (Number.isFinite(pid) && pid > 0) {
      try { process.kill(pid, 'SIGINT'); killedPid = pid; Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1500); } catch {}
      res = fn();
    }
  }
  return { res, killedPid };
}

function restartWacliSyncFollow() {
  try {
    const child = spawn('wacli', ['sync', '--follow', '--refresh-contacts', '--refresh-groups'], { detached: true, stdio: 'ignore' });
    child.unref();
  } catch {}
}

function formatHmLocal(iso) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  } catch { return ''; }
}

function toLine(m) {
  const text = (m.Text || '').replace(/\s+/g, ' ').trim();
  const media = (m.MediaType || '').toLowerCase();
  const placeholder = /^\[(audio|voice|vídeo|video|imagem|image|sticker|arquivo|file|document)\]$/i.test(text);
  let line = '';
  if (media && (!text || placeholder)) {
    if (media === 'audio' || media === 'ptt' || media === 'voice') line = '[Áudio]';
    else if (media === 'image') line = '[Imagem]';
    else if (media === 'video') line = '[Vídeo]';
    else if (media === 'document' || media === 'file') line = '[Arquivo]';
    else if (media === 'sticker') line = '[Sticker]';
    else line = '[Mídia]';
  } else if (text) {
    if (/^https?:\/\/\S+$/.test(text)) { try { line = `link: ${new URL(text).hostname}`; } catch { line = 'link'; } }
    else if (/^\[audio\]$/i.test(text)) line = '[Áudio]';
    else line = text;
  } else line = '[Mídia]';
  if (line.length > 140) line = line.slice(0, 137) + '...';
  return line;
}

function main() {
  const raw = safeReadJson(STATE_FILE);
  let state = normalizeState(raw);
  if (!raw) { writeJson(STATE_FILE, state); process.stdout.write('NOSEND\n'); return; }

  const authOk = wacliAuthStatus();
  if (!authOk) {
    if (minutesAgo(state.lastAuthNotifyAt) >= 120) {
      state.lastAuthNotifyAt = nowIsoUtc();
      writeJson(STATE_FILE, state);
      process.stdout.write('SEND\n*WhatsApp (watchdog)*\n');
      process.stdout.write('Estou sem autenticacao no wacli.\nRelinka no terminal: wacli auth\n');
      return;
    }
    process.stdout.write('NOSEND\n'); return;
  }

  const seenMsgIds = new Set();
  const byLabel = {};
  let hadAnyHardError = false;

  for (const jid of JIDS) {
    const after = state.lastSeenTs[jid] || nowIsoUtc();
    const res = runWacliList({ jid, after });
    if (!res.ok) { hadAnyHardError = true; state.errorStreak[jid] = (state.errorStreak[jid] || 0) + 1; continue; }
    state.errorStreak[jid] = 0;
    const messages = res.json?.data?.messages || [];
    if (!Array.isArray(messages) || !messages.length) continue;
    let maxTs = null;
    for (const m of messages) { if (m?.Timestamp && (!maxTs || m.Timestamp > maxTs)) maxTs = m.Timestamp; }
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
      byLabel[label].push({ ts: m.Timestamp || nowIsoUtc(), line: toLine(m), senderJid: m.SenderJID || null, isMedia: !!media || /^\[(audio|voice)\]$/i.test(text), msgId, chatJid: jid, mediaType: media || null });
    }
  }

  writeJson(STATE_FILE, state);

  const labelsOrder = ['Pai', 'Mãe', 'Laura'];
  const anyNew = labelsOrder.some(l => (byLabel[l] || []).length > 0);

  if (!anyNew) {
    const persistent = Object.values(state.errorStreak || {}).some(v => typeof v === 'number' && v >= 6);
    if (persistent && minutesAgo(state.lastErrorNotifyAt) >= 120) {
      state.lastErrorNotifyAt = nowIsoUtc();
      writeJson(STATE_FILE, state);
      process.stdout.write('SEND\n*WhatsApp (check)*\nErro persistente em alguns chats. Continuo tentando.\n');
      return;
    }
    process.stdout.write('NOSEND\n'); return;
  }

  let out = '*WhatsApp (novas mensagens)*\n\n';
  for (const label of labelsOrder) {
    const items = (byLabel[label] || []).sort((a, b) => (a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : 0));
    if (!items.length) continue;
    out += `*${label}*\n`;
    const total = items.length;
    const shownIdx = [];
    for (let i = Math.max(0, total - 3); i < total; i++) shownIdx.push(i);
    for (let pos = 0; pos < shownIdx.length; pos++) {
      const i = shownIdx[pos];
      let line = items[i].line;
      if (pos === shownIdx.length - 1) { const hidden = total - shownIdx.length; if (hidden > 0) line = `${line} (+${hidden})`; }
      const hm = formatHmLocal(items[i].ts);
      out += `• ${hm ? hm + ' ' : ''}${line}\n`;
    }
    out += '\n';
  }

  writeJson(STATE_FILE, state);
  process.stdout.write('SEND\n');
  process.stdout.write(out.trimEnd() + '\n');
}

main();
