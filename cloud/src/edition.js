import { z } from 'zod';
import { DateTime } from 'luxon';

export const ZONE = 'America/Mexico_City';
export const dayKey = (now = DateTime.now()) => now.setZone(ZONE).toISODate();
export const nextDelivery = (now = DateTime.now()) => {
  const local = now.setZone(ZONE);
  const today = local.startOf('day').plus({ hours: 8 });
  return (local < today ? today : today.plus({ days: 1 })).toUnixInteger();
};
export function validDay(day) {
  return typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day) && DateTime.fromISO(day, { zone: ZONE }).isValid;
}

export function editionKey(day, revision) {
  if (!validDay(day) || (revision !== undefined && !/^[0-9]{13}$/.test(revision))) throw new Error('Invalid edition identity');
  return revision ? `${day}/revisions/${revision}` : day;
}
export function validManifest(value, day) {
  if (!validDay(day) || !value || value.version !== 1 || value.day !== day || value.width !== 600 || value.height !== 800) return false;
  let key;
  try { key = editionKey(day, value.revision); } catch { return false; }
  if (value.bundle && !(value.bundle.path === `/device/editions/${key}/edition.cbz` && /^[a-f0-9]{64}$/.test(value.bundle.sha256) && Number.isInteger(value.bundle.bytes) && value.bundle.bytes > 0 && value.bundle.bytes <= 31000000)) return false;
  if (!Array.isArray(value.pages) || value.pages.length < 1 || value.pages.length > 20) return false;
  return value.pages.every((p, i) => p && typeof p === 'object' && p.number === i + 1 && p.path === `/device/editions/${key}/page-${i + 1}.png`
    && typeof p.sha256 === 'string' && /^[a-f0-9]{64}$/.test(p.sha256)
    && Number.isInteger(p.bytes) && p.bytes > 0 && p.bytes <= 1500000);
}
export const Article = z.object({
  title: z.string().min(8).max(110),
  summary: z.string().min(40).max(1100),
  why: z.string().min(15).max(350),
  sources: z.array(z.string().url().refine(s => s.startsWith('https://'))).min(1).max(4),
}).strict();
export const Editorial = z.object({
  headline: z.string().min(10).max(100),
  introduction: z.string().min(30).max(350),
  articles: z.array(Article).min(3).max(6),
}).strict();

// Structured Outputs does not accept JSON Schema's `uri` format. Keep full
// URL validation in Editorial after parsing the response from the API.
export const EditorialResponse = Editorial.extend({
  articles: z.array(Article.extend({
    sources: z.array(z.string().regex(/^https:\/\//)).min(1).max(4),
  })).min(3).max(6),
});

export function assertProvenance(editorial, sourceURLs) {
  const allowed = new Set(sourceURLs);
  for (const article of editorial.articles) for (const source of article.sources) {
    if (!allowed.has(source)) throw new Error('Editorial source was not retrieved');
  }
  return editorial;
}
