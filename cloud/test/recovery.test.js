import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { DateTime } from 'luxon';
import { Store } from '../src/store.js';
import { publish, latest } from '../src/publish.js';
import { deliverySample } from '../src/sample.js';
import { prune } from '../src/retention.js';

async function temporaryStore(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'la-senal-recovery-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  return { store: new Store(root), root };
}
const now = DateTime.fromISO('2026-09-28T09:00:00-06:00');

test('interrupted upload retains the old edition, even after a week without publication', async t => {
  const { store } = await temporaryStore(t);
  await publish(store, deliverySample('2026-09-01'));
  const realWrite = store.write.bind(store);
  store.write = async (name, ...args) => {
    if (name === 'editions/2026-09-28/page-2.png') throw new Error('Simulated network interruption');
    return realWrite(name, ...args);
  };
  await assert.rejects(() => publish(store, deliverySample('2026-09-28')), /Simulated network/);
  assert.equal(await store.read('editions/2026-09-28/manifest.json'), null);
  assert.ok(await store.read('editions/2026-09-28/page-1.png'));
  const visible = await latest(store, now);
  assert.equal(visible.day, '2026-09-01');
  assert.equal(visible.stale, true);
});

test('malformed and unsafe newer manifests cannot hide the last valid edition', async t => {
  const { store } = await temporaryStore(t);
  const old = await publish(store, deliverySample('2026-09-10'));
  await store.write('editions/2026-09-28/manifest.json', '{incomplete');
  await store.writeJSON('editions/2026-09-27/manifest.json', { ...old, day: '2026-09-27', pages: [{ ...old.pages[0], path: 'https://untrusted.example/collect' }] });
  await store.writeJSON('editions/2026-09-26/manifest.json', { ...old, day: '2026-09-26', pages: [null] });
  assert.equal((await latest(store, now)).day, '2026-09-10');
});

test('retention preserves the permanent archive while cleaning temporary data', async t => {
  const { store, root } = await temporaryStore(t);
  await publish(store, deliverySample('2026-08-31'));
  await publish(store, deliverySample('2026-09-01'));
  await store.write('editions/2026-09-02/page-1.png', 'orphaned upload');
  await store.write('editions/2026-08-31/notes.txt', 'unrecognized file must remain');
  await store.write('oauth/calendar', 'credential record');
  const expiredState = 'oauth/state-' + 'a'.repeat(64);
  await store.write(expiredState, 'expired state');
  await fs.utimes(path.join(root, expiredState), new Date('2026-09-27T00:00:00Z'), new Date('2026-09-27T00:00:00Z'));
  await store.writeJSON('runs/2026-08-01.json', { status: 'failed' });
  await store.writeJSON('drafts/2026-08-31/editorial.json', {temporary:true});
  const result = await prune(store, now, 7);
  assert.equal(result.protected_day, '2026-09-01');
  assert.equal(result.removed_files, 1);
  assert.equal(result.removed_states, 1);
  assert.equal(result.removed_runs, 1);
  assert.ok(await store.read('editions/2026-08-31/manifest.json'));
  assert.ok(await store.read('editions/2026-09-02/page-1.png'));
  assert.ok(await store.read('editions/2026-09-01/page-1.png'));
  assert.ok(await store.read('editions/2026-08-31/notes.txt'));
  assert.ok(await store.read('oauth/calendar'));
  assert.equal((await latest(store, now)).day, '2026-09-01');
});

test('invalid retention settings fail before deleting anything', async () => {
  let touched = false;
  const store = { list: () => { touched = true; }, remove: () => { touched = true; } };
  for (const days of [0, 1, 31, NaN, 2.5]) await assert.rejects(() => prune(store, now, days));
  assert.equal(touched, false);
});
