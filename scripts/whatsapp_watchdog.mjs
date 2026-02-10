#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
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
  return { lastSeenTs, errorStreak, lastErrorNotifyAt: null, contacts: {}, version: 4 };
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
    version: raw.version || 4,
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

  let line = '';
  if (text) {
    if (/^https?:\/\/\S+$/.test(text)) {
      try {
        const u = new URL(text);
        line = `link: ${u.hostname}`;
      } catch {
        line = 'link';
      }
    } else {
      line = text;
    }
  } else {
    if (media === 'audio') line = '[Áudio]';
    else if (media === 'image') line = '[Imagem]';
    else if (media === 'video') line = '[Vídeo]';
    else if (media === 'document' || media === 'file') line = '[Arquivo]';
    else if (media === 'sticker') line = '[Sticker]';
    else line = '[Mídia]';
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
  /** @type {Record<string, {ts:string, line:string, senderJid?:string|null}[]>} */
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
      byLabel[label].push({ ts: m.Timestamp || nowIsoUtc(), line: toLine(m), senderJid: m.SenderJID || null });
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

  // Build message
  let out = '*WhatsApp (novas mensagens)*\n\n';
  for (const label of labelsOrder) {
    const items = (byLabel[label] || []).sort((a, b) => (a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : 0));
    if (items.length === 0) continue;

    out += `*${label}*\n`;

    const total = items.length;
    const start = Math.max(0, total - 3);
    for (let i = start; i < total; i++) {
      let line = items[i].line;
      if (i === total - 1 && total > 3) line = `${line} (+${total - 3})`;

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
