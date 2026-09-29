import { DateTime } from 'luxon';
import { ZONE, validDay } from './edition.js';
const BASE = 'https://www.googleapis.com/calendar/v3';
async function paged(auth, url, params, limit = 10) {
  const items = [];
  let pageToken;
  for (let page = 0; page < limit; page++) {
    const { data } = await auth.request({ url, params: { ...params, ...(pageToken ? { pageToken } : {}) }, timeout: 15000 });
    items.push(...(data.items || []));
    pageToken = data.nextPageToken;
    if (!pageToken) return items;
  }
  throw new Error('Calendar pagination limit reached');
}
export function mergeEvents(entries) {
  const seen = new Map();
  for (const { calendar, event: e } of entries) {
    if (e.status === 'cancelled' || !e.start) continue;
    const date = e.start.date;
    const start = date ? DateTime.fromISO(date, { zone: ZONE }) : DateTime.fromISO(e.start.dateTime).setZone(ZONE);
    if (!start.isValid) throw new Error('Invalid calendar event date');
    const occurrence = e.originalStartTime?.date || (e.originalStartTime?.dateTime ? DateTime.fromISO(e.originalStartTime.dateTime).toUTC().toISO() : start.toUTC().toISO());
    const key = e.iCalUID ? `${e.iCalUID}:${occurrence}` : `${calendar.id}:${e.id}`;
    const label = calendar.summaryOverride || calendar.summary || calendar.id;
    const prior = seen.get(key);
    if (prior) { if (!prior.calendars.includes(label)) prior.calendars.push(label); continue; }
    seen.set(key, { title: (e.summary || 'Evento sin título').slice(0, 250), time: date ? 'Todo el día' : start.toFormat('HH:mm'), location: (e.location || '').slice(0,180), calendars: [label], order: date ? -Infinity : start.toMillis() });
  }
  return [...seen.values()].sort((a,b) => a.order - b.order || a.title.localeCompare(b.title, 'es')).map(({order,...event})=>event);
}
export async function readCalendars(auth, day) {
  if (!validDay(day)) throw new Error('Invalid calendar date');
  const start = DateTime.fromISO(day, { zone: ZONE }).startOf('day');
  const calendars = await paged(auth, `${BASE}/users/me/calendarList`, { maxResults: 250, minAccessRole: 'reader', showHidden: true, showDeleted: false });
  const entries = [];
  // A denied calendar aborts the edition rather than silently publishing a partial agenda.
  for (const calendar of calendars.filter(c => !c.deleted)) {
    const events = await paged(auth, `${BASE}/calendars/${encodeURIComponent(calendar.id)}/events`, {
      timeMin: start.toISO(), timeMax: start.plus({ days: 1 }).toISO(), singleEvents: true,
      orderBy: 'startTime', timeZone: ZONE, maxResults: 250,
    });
    entries.push(...events.map(event => ({ calendar, event })));
  }
  return mergeEvents(entries);
}
