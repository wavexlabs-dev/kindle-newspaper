import { createHash } from 'node:crypto';
import { DateTime } from 'luxon';
import { ZONE, nextDelivery, dayKey, validDay, validManifest, editionKey } from './edition.js';
import { renderEdition } from './render.js';
import { newsletters, calendar } from './google.js';
import { editEdition } from './editor.js';
import { generateCover } from './cover.js';
import { makeCBZ, sha256 } from './bundle.js';

export async function latest(store, now = DateTime.now()) {
  // Discover immutable commit markers, including the last edition after a long
  // outage. Age alone must not make the last successful edition disappear.
  const candidates = (await store.list('editions/')).map(entry => entry.pathname)
    .filter(name => /^editions\/\d{4}-\d{2}-\d{2}\/(?:revisions\/\d{13}\/)?manifest\.json$/.test(name)).sort().reverse();
  for (const name of candidates) {
    const day = name.split('/')[1];
    if (!validDay(day) || day > dayKey(now)) continue;
    let manifest;
    try { manifest = await store.json(name); } catch (error) { if (error instanceof SyntaxError) continue; throw error; }
    if (validManifest(manifest, day) && name === `editions/${editionKey(day, manifest.revision)}/manifest.json`) return { ...manifest, server_time: Math.floor(Date.now()/1000), stale: day !== dayKey(now), next_delivery: nextDelivery(now) };
  }
  return null;
}
export async function publish(store, edition, options = {}) {
  if (!validDay(edition.day)) throw new Error('Invalid edition date');
  const key = editionKey(edition.day, options.revision);
  const buffers = await renderEdition(edition, options);
  const pages = [];
  for (const [i, png] of buffers.entries()) {
    const name = `page-${i + 1}.png`;
    await store.write(`editions/${key}/${name}`, png, { type: 'image/png' });
    pages.push({ number: i + 1, path: `/device/editions/${key}/${name}`, sha256: createHash('sha256').update(png).digest('hex'), bytes: png.length });
  }
  await store.writeJSON(`editions/${key}/edition.json`, edition);
  const cbz = makeCBZ(buffers);
  await store.write(`editions/${key}/edition.cbz`, cbz, {type:'application/vnd.comicbook+zip'});
  const manifest = { ...(options.revision ? {revision:options.revision}:{}), bundle:{path:`/device/editions/${key}/edition.cbz`,sha256:sha256(cbz),bytes:cbz.length}, version: 1, day: edition.day, width: 600, height: 800, generated_at: new Date().toISOString(), pages };
  if (!validManifest(manifest, edition.day)) throw new Error('Invalid rendered edition');
  // Commit marker is immutable and created only after every page and metadata exists.
  await store.writeJSON(`editions/${key}/manifest.json`, manifest);
  return manifest;
}
export async function generate(store, day, { retryFailed = false, revision } = {}) {
  if (!validDay(day)) throw new Error('Invalid generation date');
  const key = editionKey(day, revision);
  const existing = await store.json(`editions/${key}/manifest.json`);
  if (existing) return { status: 'already-published', day };
  for (const name of ['OPENAI_API_KEY', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'ENCRYPTION_KEY', 'NEWSLETTER_SENDERS']) {
    if (!process.env[name]) throw new Error('Complete service configuration before generating');
  }
  if (!await store.read('oauth/newsletters') || !await store.read('oauth/calendar')) throw new Error('Connect both Google accounts first');
  // Fail closed on concurrent/repeated invocation: a failed day requires review,
  // not unlimited paid retries. Never silently fall back to demo content.
  const prior = await store.json(`runs/${key}.json`);
  // One repair attempt is allowed for the verified legacy URI-schema 400.
  const schemaRepair = prior?.attempt === 2 && prior?.stage === 'editorial' && prior?.error?.status === 400;
  if (prior && (!retryFailed || prior.status !== 'failed' || ((prior.attempt || 1) >= 2 && !schemaRepair))) throw new Error('Generation already attempted; review required');
  const attempt = prior ? (prior.attempt || 1) + 1 : 1;
  if (prior) await store.writeJSON(`runs/${key}-retry-${attempt}.json`, { at: new Date().toISOString() });
  const audit = { ...(revision ? {revision}:{}), attempt, at: new Date().toISOString(), stage: 'sources' };
  await store.writeJSON(`runs/${key}.json`, { ...audit, status: 'started' }, { overwrite: !!prior });
  try {
    const [mail, agenda] = await Promise.all([newsletters(store), calendar(store, day)]);
    audit.newsletter_count = mail.length;
    audit.agenda_count = agenda.length;
    if (!mail.length) throw new Error('No matching newsletters');
    audit.stage = 'editorial';
    await store.writeJSON(`runs/${key}.json`, { ...audit, status: 'started' }, { overwrite: true });
    const draftPath = `drafts/${key}/editorial.json`;
    const draft = await store.json(draftPath) || await editEdition(mail, day);
    if (!await store.json(draftPath)) await store.writeJSON(draftPath, draft);
    const { editorial, usage } = draft;
    audit.stage = 'cover';
    await store.writeJSON(`runs/${key}.json`, { ...audit, status:'started' }, {overwrite:true});
    let cover = await store.read(`drafts/${key}/cover.png`);
    if (!cover) {
      const generated = await generateCover(editorial, day);
      cover = generated.png;
      await store.write(`drafts/${key}/cover.png`, cover, {type:'image/png'});
      await store.writeJSON(`drafts/${key}/cover-usage.json`, {model:generated.model,usage:generated.usage});
    }
    audit.stage = 'render_publish';
    const manifest = await publish(store, { day, editorial, agenda }, {cover,revision});
    await store.writeJSON(`runs/${key}.json`, { ...audit, status: 'published', pages: manifest.pages.length, usage }, { overwrite: true });
    return { status: 'published', day, pages: manifest.pages.length };
  } catch (error) {
    await store.writeJSON(`runs/${key}.json`, { ...audit, status: 'failed', error: safeGenerationError(error) }, { overwrite: true });
    throw error;
  }
}

export function safeGenerationError(error) {
  const known = ['No matching newsletters', 'Research did not complete', 'Insufficient verified source URLs', 'Editorial did not complete', 'Editorial source was not retrieved', 'Edition exceeds page limit', 'Invalid rendered edition'];
  if (known.includes(error.message)) return error.message;
  if (error.name === 'ZodError') return 'Editorial schema validation failed';
  return { type: String(error.name || 'Error').slice(0, 60), status: Number.isInteger(error.status) ? error.status : null };
}
