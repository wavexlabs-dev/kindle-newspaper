// Temporary, loopback-only credential handoff. Never log or echo entered values.
import http from 'node:http';
import fs from 'node:fs/promises';
import { randomBytes, timingSafeEqual } from 'node:crypto';

const port = 4339;
const origin = `http://127.0.0.1:${port}`;
const nonce = randomBytes(32).toString('hex');
const fields = ['OPENAI_API_KEY', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
const out = new URL('../.local/cloud-credentials.json', import.meta.url);
const html = `<!doctype html><html lang="es"><meta charset="utf-8"><title>La Señal · Configuración local</title><body><h1>La Señal</h1><p>Configuración local de credenciales. Los valores se guardan solamente en este Mac, fuera de Git. No los pegues en el chat.</p><form method="post" action="/save"><input type="hidden" name="nonce" value="${nonce}">${fields.map(name => `<p><label>${name}<br><input type="password" name="${name}" autocomplete="off" size="70"></label></p>`).join('')}<p>Completa únicamente los campos disponibles. Los vacíos conservan la configuración anterior.</p><button>Guardar localmente</button></form></body></html>`;
http.createServer(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Security-Policy', "default-src 'none'; form-action 'self'; frame-ancestors 'none'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.headers.host !== `127.0.0.1:${port}`) { res.writeHead(403); return res.end(); }
  if (req.method === 'GET' && req.url === '/') { res.setHeader('Content-Type', 'text/html; charset=utf-8'); return res.end(html); }
  if (req.method !== 'POST' || req.url !== '/save' || req.headers.origin !== origin) { res.writeHead(403); return res.end(); }
  try {
    let body = '';
    for await (const chunk of req) { body += chunk; if (body.length > 16384) throw new Error('too large'); }
    const form = new URLSearchParams(body), received = Buffer.from(form.get('nonce') || '');
    const expected = Buffer.from(nonce);
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) throw new Error('invalid nonce');
    let saved = {};
    try { saved = JSON.parse(await fs.readFile(out, 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
    for (const name of fields) {
      const value = form.get(name)?.trim();
      if (value) { if (value.length < 12 || value.length > 4096 || /\s/.test(value)) throw new Error('invalid value'); saved[name] = value; }
    }
    await fs.mkdir(new URL('../.local/', import.meta.url), { recursive: true });
    await fs.writeFile(out, JSON.stringify(saved), { mode: 0o600 });
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Credenciales guardadas localmente. Puedes cerrar esta pestaña.');
  } catch { res.writeHead(400); res.end('No se pudo guardar. Revisa los campos sin compartirlos en el chat.'); }
}).listen(port, '127.0.0.1', () => console.log(`Configuración local: ${origin}`));
