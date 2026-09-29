import { createHash } from 'node:crypto';
import { DateTime } from 'luxon';
import { ZONE, nextDelivery, dayKey, validDay, validManifest } from './edition.js';
import { renderEdition } from './render.js';
import { newsletters, calendar } from './google.js';
import { editEdition } from './editor.js';

export async function latest(store, now = DateTime.now()) {
  // Discover immutable commit markers, including the last edition after a long
  // outage. Age alone must not make the last successful edition disappear.
  const candidates = (await store.list('editions/')).map(entry => entry.pathname)
    .filter(name => /^editions\/\d{4}-\d{2}-\d{2}\/manifest\.json$/.test(name)).sort().reverse();
  for (const name of candidates) {
    const day = name.split('/')[1];
    if (!validDay(day) || day > dayKey(now)) continue;
    let manifest;
    try { manifest = await store.json(name); } catch (error) { if (error instanceof SyntaxError) continue; throw error; }
    if (validManifest(manifest, day)) return { ...manifest, stale: day !== dayKey(now), next_delivery: nextDelivery(now) };
  }
  return null;
}
export async function publish(store, edition) {
  if (!validDay(edition.day)) throw new Error('Invalid edition date');
  const buffers = await renderEdition(edition);
  const pages = [];
  for (const [i, png] of buffers.entries()) {
    const name = `page-${i + 1}.png`;
    await store.write(`editions/${edition.day}/${name}`, png, { type: 'image/png' });
    pages.push({ number: i + 1, path: `/device/editions/${edition.day}/${name}`, sha256: createHash('sha256').update(png).digest('hex'), bytes: png.length });
  }
  await store.writeJSON(`editions/${edition.day}/edition.json`, edition);
  const manifest = { version: 1, day: edition.day, width: 600, height: 800, generated_at: new Date().toISOString(), pages };
  if (!validManifest(manifest, edition.day)) throw new Error('Invalid rendered edition');
  // Commit marker is immutable and created only after every page and metadata exists.
  await store.writeJSON(`editions/${edition.day}/manifest.json`, manifest);
  return manifest;
}
export async function generate(store, day) {
  if (!validDay(day)) throw new Error('Invalid generation date');
  const existing = await store.json(`editions/${day}/manifest.json`);
  if (existing) return { status: 'already-published', day };
  for (const name of ['OPENAI_API_KEY', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'ENCRYPTION_KEY', 'NEWSLETTER_SENDERS']) {
    if (!process.env[name]) throw new Error('Complete service configuration before generating');
  }
  if (!await store.read('oauth/newsletters') || !await store.read('oauth/calendar')) throw new Error('Connect both Google accounts first');
  // Fail closed on concurrent/repeated invocation: a failed day requires review,
  // not unlimited paid retries. Never silently fall back to demo content.
  await store.writeJSON(`runs/${day}.json`, { status: 'started', at: new Date().toISOString() });
  try {
    const [mail, agenda] = await Promise.all([newsletters(store), calendar(store, day)]);
    const { editorial, usage } = await editEdition(mail, day);
    const manifest = await publish(store, { day, editorial, agenda });
    await store.writeJSON(`runs/${day}.json`, { status: 'published', pages: manifest.pages.length, usage }, { overwrite: true });
    return { status: 'published', day, pages: manifest.pages.length };
  } catch (error) {
    await store.writeJSON(`runs/${day}.json`, { status: 'failed', at: new Date().toISOString() }, { overwrite: true });
    throw error;
  }
}
