import express from 'express';
import { Store } from './store.js';
import { equalSecret } from './security.js';
import { startOAuth, finishOAuth } from './google.js';
import { dayKey } from './edition.js';
import { latest, generate } from './publish.js';
import { renderEdition } from './render.js';
import { deliverySample } from './sample.js';
import { createHash } from 'node:crypto';

export function createApp(store = new Store()) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '8kb' }));
  app.use((req, res, next) => {
    res.set({ 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'" });
    next();
  });
  const auth = variable => (req, res, next) => {
    const header = req.get('authorization') || '';
    if (!header.startsWith('Bearer ') || !equalSecret(header.slice(7), process.env[variable])) return res.sendStatus(401);
    next();
  };
  app.get('/', (_req, res) => res.type('text').send('La Señal · Periódico personal de IA y tecnología. Acceso privado.'));
  app.get('/health', (_req, res) => res.json({ service: 'la-senal', status: 'running' }));
  app.post('/admin/oauth/:role', auth('ADMIN_TOKEN'), async (req, res) => res.json({ url: await startOAuth(store, req.params.role) }));
  app.get('/oauth/callback', async (req, res) => {
    if (req.query.error) return res.status(400).type('text').send('No se concedió acceso. Puedes volver a intentarlo desde la configuración.');
    await finishOAuth(store, req.query.state, req.query.code);
    res.type('text').send('Cuenta conectada a La Señal. Ya puedes cerrar esta pestaña.');
  });
  app.get('/admin/status', auth('ADMIN_TOKEN'), async (_req, res) => res.json({
    newsletters: !!await store.read('oauth/newsletters'), calendar: !!await store.read('oauth/calendar'),
    latest: (await latest(store))?.day || null, today: await store.json(`runs/${dayKey()}.json`),
  }));
  app.post('/admin/generate', auth('ADMIN_TOKEN'), async (_req, res) => res.json(await generate(store, dayKey())));
  app.post('/admin/test-delivery', auth('ADMIN_TOKEN'), async (_req, res) => {
    const [png] = await renderEdition(deliverySample(dayKey()));
    // Explicit test object, never published as the daily edition.
    await store.write('checks/cover.png', png, { overwrite: true, type: 'image/png' });
    res.json({ test: true, path: '/device/test-cover.png', bytes: png.length, sha256: createHash('sha256').update(png).digest('hex') });
  });
  app.get('/cron/generate', auth('CRON_SECRET'), async (_req, res) => res.json(await generate(store, dayKey())));
  app.use('/device', auth('DEVICE_TOKEN'));
  app.get('/device/test-cover.png', async (_req, res) => {
    const png = await store.read('checks/cover.png');
    if (!png) return res.sendStatus(404);
    res.type('image/png').send(png);
  });
  app.get('/device/manifest', async (_req, res) => {
    const edition = await latest(store);
    if (!edition) return res.status(503).json({ error: 'No published edition' });
    res.json(edition);
  });
  app.get('/device/editions/:day/:file', async (req, res) => {
    const { day, file } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !/^(page-([1-9]|1\d|20)\.png|edition\.json)$/.test(file)) return res.sendStatus(404);
    // Uncommitted uploads are never visible to readers.
    if (!await store.read(`editions/${day}/manifest.json`)) return res.sendStatus(404);
    const data = await store.read(`editions/${day}/${file}`);
    if (!data) return res.sendStatus(404);
    res.type(file.endsWith('.png') ? 'image/png' : 'application/json').send(data);
  });
  app.use((_req, res) => res.sendStatus(404));
  app.use((error, _req, res, _next) => {
    // Do not log request URLs, upstream objects, mail bodies or token responses.
    console.error('request_failed', error.name || 'Error');
    res.status(500).json({ error: 'Operation failed; last published edition preserved' });
  });
  return app;
}

export default createApp();
