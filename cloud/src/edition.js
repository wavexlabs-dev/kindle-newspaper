import { z } from 'zod';
import { DateTime } from 'luxon';

export const ZONE = 'America/Mexico_City';
export const dayKey = (now = DateTime.now()) => now.setZone(ZONE).toISODate();
export const nextDelivery = (now = DateTime.now()) => {
  const local = now.setZone(ZONE);
  const today = local.startOf('day').plus({ hours: 8 });
  return (local < today ? today : today.plus({ days: 1 })).toUnixInteger();
};
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

export function assertProvenance(editorial, sourceURLs) {
  const allowed = new Set(sourceURLs);
  for (const article of editorial.articles) for (const source of article.sources) {
    if (!allowed.has(source)) throw new Error('Editorial source was not retrieved');
  }
  return editorial;
}
