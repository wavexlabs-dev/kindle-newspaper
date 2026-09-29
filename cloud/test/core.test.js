import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { DateTime } from 'luxon';
import { equalSecret, seal, unseal, safePath } from '../src/security.js';
import { nextDelivery, assertProvenance } from '../src/edition.js';
import { Store } from '../src/store.js';
import { publish, latest } from '../src/publish.js';
import { createApp } from '../src/app.js';
import { renderEdition, lines } from '../src/render.js';

export const fixture = {
  day: '2026-09-28', agenda: [{ time: '08:30', title: 'Evento ficticio de prueba', location: '' }],
  editorial: {
    headline: 'Edición de prueba: una portada para empezar el día',
    introduction: 'Estos textos son ejemplos de maquetación, no noticias reales. Sirven para verificar legibilidad, privacidad y paginación antes de conectar las fuentes.',
    articles: Array.from({ length: 3 }, (_, i) => ({ title: `Prueba ${i + 1}: cómo leer las señales de la tecnología`, summary: 'Este es un texto de muestra para comprobar que el periódico se puede leer cómodamente en una pantalla pequeña. El contenido real se preparará con fuentes verificadas y las newsletters seleccionadas. '.repeat(3), why: 'La prueba permite revisar el tamaño de las letras y el paso entre páginas antes de activar la entrega diaria.', sources: ['https://example.com/'] })),
  },
};
test('secrets fail closed and encrypted records reject tampering', () => {
  assert.equal(equalSecret('', ''), false);
  assert.equal(equalSecret('x'.repeat(32), 'x'.repeat(32)), true);
  const key = randomBytes(32), record = seal({ refresh_token: 'private' }, key);
  assert.equal(unseal(record, key).refresh_token, 'private');
  const corrupt = Buffer.from(record, 'base64url'); corrupt[30] ^= 1;
  assert.throws(() => unseal(corrupt.toString('base64url'), key));
  for (const p of ['../secret', '/absolute', 'a/../b', 'a//b']) assert.throws(() => safePath(p));
});
test('8am scheduling uses Mexico City and advances after delivery', () => {
  assert.equal(nextDelivery(DateTime.fromISO('2026-09-28T07:59:00-06:00')), DateTime.fromISO('2026-09-28T08:00:00-06:00').toUnixInteger());
  assert.equal(nextDelivery(DateTime.fromISO('2026-09-28T08:00:00-06:00')), DateTime.fromISO('2026-09-29T08:00:00-06:00').toUnixInteger());
});
test('editorial cannot introduce an unobserved source', () => {
  assert.throws(() => assertProvenance(fixture.editorial, []));
  assertProvenance(fixture.editorial, ['https://example.com/']);
});
test('renderer produces Kindle-sized pages and preserves long text through pagination', async () => {
  assert.ok(lines('x'.repeat(150), 20).length > 1);
  const buffers = await renderEdition(fixture);
  assert.ok(buffers.length >= 5 && buffers.length <= 20);
  for (const buffer of buffers) {
    const image = await sharp(buffer).metadata();
    assert.equal(image.width, 600); assert.equal(image.height, 800); assert.equal(image.format, 'png');
  }
});
test('partial publication stays invisible; complete publication is immutable', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'la-senal-test-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const store = new Store(root);
  await store.write('editions/2026-09-28/partial.png', Buffer.from('incomplete'));
  const now = DateTime.fromISO('2026-09-28T12:00:00-06:00');
  assert.equal(await latest(store, now), null);
  await publish(store, fixture);
  assert.equal((await latest(store, now)).day, fixture.day);
  await assert.rejects(() => publish(store, fixture));
});
test('device routes require their own credential, not the admin credential', async t => {
  const oldDevice = process.env.DEVICE_TOKEN, oldAdmin = process.env.ADMIN_TOKEN;
  process.env.DEVICE_TOKEN = 'd'.repeat(64); process.env.ADMIN_TOKEN = 'a'.repeat(64);
  const server = createApp({ json: async () => null, list: async () => [] }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => { server.close(); if (oldDevice === undefined) delete process.env.DEVICE_TOKEN; else process.env.DEVICE_TOKEN = oldDevice; if (oldAdmin === undefined) delete process.env.ADMIN_TOKEN; else process.env.ADMIN_TOKEN = oldAdmin; });
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.equal((await fetch(base + '/device/manifest')).status, 401);
  assert.equal((await fetch(base + '/device/manifest', { headers: { authorization: 'Bearer ' + 'a'.repeat(64) } })).status, 401);
  assert.equal((await fetch(base + '/device/manifest', { headers: { authorization: 'Bearer ' + 'd'.repeat(64) } })).status, 503);
});
