import { DateTime } from 'luxon';
import { ZONE, validDay } from './edition.js';
import { latest } from './publish.js';

export async function prune(store, now = DateTime.now(), days = Number(process.env.RETENTION_DAYS || 7)) {
  if (!Number.isInteger(days) || days < 2 || days > 30) throw new Error('Retention must be between 2 and 30 days');
  const local = now.setZone(ZONE);
  const cutoff = local.startOf('day').minus({ days: days - 1 }).toISODate();
  const protectedDay = (await latest(store, now))?.day;
  const candidates = [];
  for (const item of await store.list('editions/')) {
    const match = /^editions\/(\d{4}-\d{2}-\d{2})\/(manifest\.json|edition\.json|page-(?:[1-9]|1\d|20)\.png)$/.exec(item.pathname);
    if (match && validDay(match[1]) && match[1] < cutoff && match[1] !== protectedDay) candidates.push(item.pathname);
  }
  // Unpublish expired editions before removing their component files. In-flight
  // readers then retain their previously validated local edition and retry.
  candidates.sort((a, b) => Number(b.endsWith('/manifest.json')) - Number(a.endsWith('/manifest.json')) || a.localeCompare(b));
  for (const name of candidates) await store.remove(name);
  let expiredStates = 0;
  for (const item of await store.list('oauth/state-')) {
    if (!/^oauth\/state-[a-f0-9]{64}$/.test(item.pathname)) continue;
    if (new Date(item.uploadedAt).getTime() < now.toMillis() - 3600000) { await store.remove(item.pathname); expiredStates++; }
  }
  let expiredRuns = 0;
  const runCutoff = local.startOf('day').minus({ days: 30 }).toISODate();
  for (const item of await store.list('runs/')) {
    const match = /^runs\/(\d{4}-\d{2}-\d{2})\.json$/.exec(item.pathname);
    if (match && validDay(match[1]) && match[1] < runCutoff) { await store.remove(item.pathname); expiredRuns++; }
  }
  return { removed_files: candidates.length, removed_states: expiredStates, removed_runs: expiredRuns, protected_day: protectedDay || null };
}
