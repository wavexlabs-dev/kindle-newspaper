import { get, put, del } from '@vercel/blob';
import fs from 'node:fs/promises';
import path from 'node:path';
import { safePath } from './security.js';

// Local storage is deliberately opt-in and never permitted in production.
export class Store {
  constructor(local = process.env.LOCAL_DATA_DIR) {
    if (local && process.env.VERCEL) throw new Error('Local storage forbidden on Vercel');
    this.local = local ? path.resolve(local) : null;
  }
  async read(name) {
    safePath(name);
    if (this.local) {
      try { return await fs.readFile(path.join(this.local, name)); }
      catch (e) { if (e.code === 'ENOENT') return null; throw e; }
    }
    const result = await get(name, { access: 'private', useCache: false });
    if (!result) return null;
    if (result.statusCode !== 200) throw new Error('Unexpected storage response');
    return Buffer.from(await new Response(result.stream).arrayBuffer());
  }
  async write(name, body, { overwrite = false, type = 'application/octet-stream' } = {}) {
    safePath(name);
    if (this.local) {
      const target = path.join(this.local, name);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, body, { flag: overwrite ? 'w' : 'wx', mode: 0o600 });
      return;
    }
    await put(name, body, { access: 'private', addRandomSuffix: false, allowOverwrite: overwrite, contentType: type });
  }
  async json(name) { const b = await this.read(name); return b ? JSON.parse(b) : null; }
  async writeJSON(name, value, options) { return this.write(name, JSON.stringify(value), { ...options, type: 'application/json' }); }
  async remove(name) {
    safePath(name);
    if (this.local) await fs.rm(path.join(this.local, name), { force: true });
    else await del(name);
  }
}
