import http from 'node:http';
import { bearer, isInitialize, readJson, sendJson } from './common.mjs';
import { RelayCore } from './relay-core.mjs';

function parseDeviceTokens(raw) {
  if (!raw) return {};
  try { return JSON.parse(raw); }
  catch { throw new Error('DEVICE_TOKENS_JSON must be valid JSON'); }
}

export function createRelayServer(options = {}) {
  const accessToken = options.accessToken ?? process.env.MCP_ACCESS_TOKEN;
  const deviceTokens = options.deviceTokens ?? parseDeviceTokens(process.env.DEVICE_TOKENS_JSON || '{}');
  if (!accessToken) throw new Error('MCP_ACCESS_TOKEN is required');
  if (!Object.keys(deviceTokens).length) throw new Error('DEVICE_TOKENS_JSON must define at least one device token');

  const core = options.core ?? new RelayCore({
    requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS || 120000),
    pollTimeoutMs: Number(process.env.POLL_TIMEOUT_MS || 25000),
    sessionTtlMs: Number(process.env.SESSION_TTL_MS || 1800000),
  });

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (req.method === 'GET' && url.pathname === '/health') {
        return sendJson(res, 200, { ok: true, service: 'kodentra-commander-relay', version: '0.1.0' });
      }

      const agentMatch = /^\/agent\/(poll|result)\/([^/]+)$/.exec(url.pathname);
      if (agentMatch) {
        const [, action, encoded] = agentMatch;
        const deviceId = decodeURIComponent(encoded);
        if (!deviceTokens[deviceId] || bearer(req) !== deviceTokens[deviceId]) {
          return sendJson(res, 401, { error: 'unauthorized device' });
        }
        if (req.method !== 'POST') return sendJson(res, 405, { error: 'method not allowed' });
        const body = await readJson(req);
        if (action === 'poll') {
          const job = await core.poll(deviceId, {
            name: body?.name,
            platform: body?.platform,
            agentVersion: body?.agentVersion,
          });
          if (!job) { res.writeHead(204, { 'cache-control': 'no-store' }); return res.end(); }
          return sendJson(res, 200, job);
        }
        const accepted = core.complete(deviceId, body);
        return sendJson(res, accepted ? 200 : 404, { accepted });
      }

      if (req.method === 'GET' && url.pathname === '/admin/devices') {
        if (bearer(req) !== accessToken) return sendJson(res, 401, { error: 'unauthorized' });
        return sendJson(res, 200, { devices: core.listDevices() });
      }

      const mcpMatch = /^\/mcp\/([^/]+)$/.exec(url.pathname);
      if (!mcpMatch) return sendJson(res, 404, { error: 'not found' });
      const deviceId = decodeURIComponent(mcpMatch[1]);
      if (bearer(req) !== accessToken) return sendJson(res, 401, { error: 'unauthorized' });

      if (req.method === 'GET') {
        return sendJson(res, 405, { jsonrpc: '2.0', error: { code: -32000, message: 'SSE not enabled; use Streamable HTTP POST.' }, id: null });
      }

      if (req.method === 'DELETE') {
        const sessionId = req.headers['mcp-session-id'];
        if (!sessionId || !core.validateSession(sessionId, deviceId)) return sendJson(res, 404, { error: 'unknown session' });
        try { await core.enqueue(deviceId, { type: 'session_close', sessionId }); } catch {}
        core.closeSession(sessionId);
        res.writeHead(204); return res.end();
      }

      if (req.method !== 'POST') return sendJson(res, 405, { error: 'method not allowed' });
      const body = await readJson(req);
      let sessionId = req.headers['mcp-session-id'];
      const init = isInitialize(body);
      if (!sessionId && init) sessionId = core.createSession(deviceId);
      else if (!sessionId || !core.validateSession(sessionId, deviceId)) {
        return sendJson(res, 400, { jsonrpc: '2.0', error: { code: -32000, message: 'Missing or invalid Mcp-Session-Id' }, id: body?.id ?? null });
      }

      let result;
      try {
        result = await core.enqueue(deviceId, { type: 'mcp', sessionId, body });
      } catch (err) {
        if (init) core.closeSession(sessionId);
        throw err;
      }
      const headers = { 'mcp-session-id': sessionId };
      if (result.status === 202 || result.body == null) {
        res.writeHead(202, { ...headers, 'cache-control': 'no-store' }); return res.end();
      }
      return sendJson(res, result.status || 200, result.body, headers);
    } catch (err) {
      const status = err.statusCode || (err.code === 'DEVICE_OFFLINE' ? 503 : err.code === 'DEVICE_TIMEOUT' ? 504 : 500);
      return sendJson(res, status, { error: err.message });
    }
  });
  return { server, core };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT || 8787);
  const host = process.env.HOST || '127.0.0.1';
  const { server } = createRelayServer();
  server.listen(port, host, () => console.log(`kodentra-commander relay listening on http://${host}:${port}`));
}
