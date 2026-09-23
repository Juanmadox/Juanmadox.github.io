import { randomId } from './common.mjs';

export class RelayCore {
  constructor({ requestTimeoutMs = 120000, pollTimeoutMs = 25000, sessionTtlMs = 30 * 60 * 1000 } = {}) {
    this.requestTimeoutMs = requestTimeoutMs;
    this.pollTimeoutMs = pollTimeoutMs;
    this.sessionTtlMs = sessionTtlMs;
    this.devices = new Map();
    this.pending = new Map();
    this.sessions = new Map();
  }

  touchDevice(deviceId, meta = {}) {
    const d = this.devices.get(deviceId) ?? { queue: [], waiters: [] };
    Object.assign(d, meta, { lastSeen: Date.now() });
    this.devices.set(deviceId, d);
    return d;
  }

  isOnline(deviceId) {
    const d = this.devices.get(deviceId);
    return !!d && Date.now() - d.lastSeen < Math.max(this.pollTimeoutMs * 2 + 5000, 60000);
  }

  async enqueue(deviceId, job) {
    const d = this.devices.get(deviceId);
    if (!d || !this.isOnline(deviceId)) {
      const err = new Error(`device '${deviceId}' is offline`);
      err.code = 'DEVICE_OFFLINE';
      throw err;
    }
    const requestId = randomId('job_');
    const fullJob = { ...job, requestId };

    const resultPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(requestId);
        const err = new Error(`device '${deviceId}' timed out`);
        err.code = 'DEVICE_TIMEOUT';
        reject(err);
      }, this.requestTimeoutMs);
      this.pending.set(requestId, { deviceId, resolve, reject, timer });
    });

    const waiter = d.waiters.shift();
    if (waiter) waiter(fullJob);
    else d.queue.push(fullJob);
    return resultPromise;
  }

  async poll(deviceId, meta = {}) {
    const d = this.touchDevice(deviceId, meta);
    const queued = d.queue.shift();
    if (queued) return queued;
    return new Promise(resolve => {
      const timer = setTimeout(() => {
        const idx = d.waiters.indexOf(deliver);
        if (idx >= 0) d.waiters.splice(idx, 1);
        resolve(null);
      }, this.pollTimeoutMs);
      const deliver = job => {
        clearTimeout(timer);
        resolve(job);
      };
      d.waiters.push(deliver);
    });
  }

  complete(deviceId, result) {
    const p = this.pending.get(result?.requestId);
    if (!p || p.deviceId !== deviceId) return false;
    clearTimeout(p.timer);
    this.pending.delete(result.requestId);
    p.resolve(result);
    this.touchDevice(deviceId);
    return true;
  }

  createSession(deviceId) {
    const sessionId = randomId('mcp_');
    this.sessions.set(sessionId, { deviceId, createdAt: Date.now(), lastSeen: Date.now() });
    return sessionId;
  }

  validateSession(sessionId, deviceId) {
    const s = this.sessions.get(sessionId);
    if (!s || s.deviceId !== deviceId) return false;
    if (Date.now() - s.lastSeen > this.sessionTtlMs) {
      this.sessions.delete(sessionId);
      return false;
    }
    s.lastSeen = Date.now();
    return true;
  }

  closeSession(sessionId) {
    return this.sessions.delete(sessionId);
  }

  listDevices() {
    return [...this.devices.entries()].map(([id, d]) => ({
      id,
      name: d.name ?? id,
      platform: d.platform ?? null,
      online: this.isOnline(id),
      lastSeen: new Date(d.lastSeen).toISOString(),
      queued: d.queue.length,
    }));
  }
}
