import os from 'node:os';
import { StdioMcpSession } from './stdio-session.mjs';
import { sleep } from './common.mjs';

const relayUrl = (process.env.RELAY_URL || '').replace(/\/$/, '');
const deviceId = process.env.DEVICE_ID || os.hostname();
const deviceToken = process.env.DEVICE_TOKEN || '';
const command = process.env.DESKTOP_COMMAND || 'npx --yes @wonderwhy-er/desktop-commander@0.2.51';
const pollers = Math.max(1, Number(process.env.POLLERS || 2));
const localTimeoutMs = Number(process.env.LOCAL_MCP_TIMEOUT_MS || 120000);
const sessionTtlMs = Number(process.env.LOCAL_SESSION_TTL_MS || 35 * 60 * 1000);

if (!relayUrl || !deviceToken) {
  console.error('RELAY_URL and DEVICE_TOKEN are required');
  process.exit(2);
}

const sessions = new Map();
function getSession(sessionId) {
  let item = sessions.get(sessionId);
  if (!item) {
    item = {
      session: new StdioMcpSession({ command, sessionId, onLog: s => process.stderr.write(s) }),
      lastSeen: Date.now(),
    };
    sessions.set(sessionId, item);
  }
  item.lastSeen = Date.now();
  return item.session;
}

async function api(path, init = {}) {
  return fetch(`${relayUrl}${path}`, {
    ...init,
    headers: {
      'authorization': `Bearer ${deviceToken}`,
      'content-type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

async function submit(result) {
  const res = await api(`/agent/result/${encodeURIComponent(deviceId)}`, { method: 'POST', body: JSON.stringify(result) });
  if (!res.ok && res.status !== 404) throw new Error(`result rejected: HTTP ${res.status}`);
}

async function handleJob(job) {
  if (job.type === 'session_close') {
    sessions.get(job.sessionId)?.session.close();
    sessions.delete(job.sessionId);
    return { requestId: job.requestId, status: 204, body: null };
  }
  if (job.type !== 'mcp') return { requestId: job.requestId, status: 400, body: { error: 'unknown job type' } };
  try {
    const response = await getSession(job.sessionId).request(job.body, localTimeoutMs);
    return { requestId: job.requestId, status: response == null ? 202 : 200, body: response };
  } catch (err) {
    return {
      requestId: job.requestId,
      status: 502,
      body: { jsonrpc: '2.0', error: { code: -32603, message: `Local MCP failure: ${err.message}` }, id: job.body?.id ?? null },
    };
  }
}

async function pollLoop(index) {
  let backoff = 500;
  while (true) {
    try {
      const res = await api(`/agent/poll/${encodeURIComponent(deviceId)}`, {
        method: 'POST',
        body: JSON.stringify({ name: os.hostname(), platform: `${os.platform()} ${os.release()}`, agentVersion: '0.1.0', poller: index }),
      });
      if (res.status === 204) { backoff = 500; continue; }
      if (res.status === 401) throw new Error('device authentication rejected');
      if (!res.ok) throw new Error(`poll HTTP ${res.status}`);
      const job = await res.json();
      await submit(await handleJob(job));
      backoff = 500;
    } catch (err) {
      console.error(`[poller ${index}] ${err.message}`);
      await sleep(backoff);
      backoff = Math.min(backoff * 2, 10000);
    }
  }
}

setInterval(() => {
  const cutoff = Date.now() - sessionTtlMs;
  for (const [id, item] of sessions) {
    if (item.lastSeen < cutoff) { item.session.close(); sessions.delete(id); }
  }
}, 60000).unref();

console.log(`kodentra-commander agent device=${deviceId} relay=${relayUrl} pollers=${pollers}`);
await Promise.all(Array.from({ length: pollers }, (_, i) => pollLoop(i + 1)));
