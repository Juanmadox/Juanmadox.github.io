import { spawn } from 'node:child_process';
import readline from 'node:readline';
import { rpcIds } from './common.mjs';

function key(id) { return `${typeof id}:${String(id)}`; }

export class StdioMcpSession {
  constructor({ command, sessionId, onLog = () => {} }) {
    this.command = command;
    this.sessionId = sessionId;
    this.onLog = onLog;
    this.proc = null;
    this.pending = [];
    this.chain = Promise.resolve();
  }

  start() {
    if (this.proc) return;
    this.proc = spawn(this.command, { shell: true, stdio: ['pipe', 'pipe', 'pipe'], env: process.env });
    this.proc.stderr.setEncoding('utf8');
    this.proc.stderr.on('data', d => this.onLog(`[${this.sessionId}] ${d}`));
    this.proc.on('exit', (code, signal) => {
      const err = new Error(`Desktop Commander exited code=${code} signal=${signal}`);
      for (const p of this.pending.splice(0)) p.reject(err);
      this.proc = null;
    });
    const rl = readline.createInterface({ input: this.proc.stdout });
    rl.on('line', line => {
      let msg;
      try { msg = JSON.parse(line); } catch { this.onLog(`[${this.sessionId}] non-json stdout: ${line}`); return; }
      const msgIds = new Set(rpcIds(msg).map(key));
      const idx = this.pending.findIndex(p => p.ids.every(id => msgIds.has(key(id))));
      if (idx >= 0) {
        const [p] = this.pending.splice(idx, 1);
        clearTimeout(p.timer);
        p.resolve(msg);
      } else {
        this.onLog(`[${this.sessionId}] unsolicited MCP message: ${line.slice(0, 500)}`);
      }
    });
  }

  request(body, timeoutMs = 120000) {
    // A failed request must not poison the session queue forever.
    const run = this.chain.catch(() => undefined).then(() => this.#requestInner(body, timeoutMs));
    this.chain = run.catch(() => undefined);
    return run;
  }

  #requestInner(body, timeoutMs) {
    this.start();
    const ids = rpcIds(body);
    this.proc.stdin.write(`${JSON.stringify(body)}\n`);
    if (!ids.length) return Promise.resolve(null);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const idx = this.pending.findIndex(p => p.resolve === resolve);
        if (idx >= 0) this.pending.splice(idx, 1);
        reject(new Error(`local MCP response timeout after ${timeoutMs}ms`));
      }, timeoutMs);
      this.pending.push({ ids, resolve, reject, timer });
    });
  }

  close() {
    if (!this.proc) return;
    this.proc.kill('SIGTERM');
    this.proc = null;
  }
}
