import crypto from 'node:crypto';

export function randomId(prefix = '') {
  return prefix + crypto.randomUUID();
}

export function bearer(req) {
  const value = req.headers.authorization || '';
  const m = /^Bearer\s+(.+)$/i.exec(value);
  return m?.[1] ?? null;
}

export async function readJson(req, maxBytes = 2 * 1024 * 1024) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > maxBytes) {
      const err = new Error('request body too large');
      err.statusCode = 413;
      throw err;
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return null;
  const text = Buffer.concat(chunks).toString('utf8');
  try { return JSON.parse(text); }
  catch {
    const err = new Error('invalid JSON');
    err.statusCode = 400;
    throw err;
  }
}

export function sendJson(res, status, body, headers = {}) {
  const data = body === undefined || body === null ? '' : JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...headers,
  });
  res.end(data);
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function rpcIds(body) {
  const msgs = Array.isArray(body) ? body : [body];
  return msgs.filter(x => x && Object.hasOwn(x, 'id')).map(x => x.id);
}

export function isInitialize(body) {
  return !Array.isArray(body) && body?.method === 'initialize';
}
