import { OAuth2Client } from 'google-auth-library';
import { createHash, randomBytes } from 'node:crypto';
import { convert } from 'html-to-text';
import { DateTime } from 'luxon';
import { seal, unseal } from './security.js';
import { ZONE } from './edition.js';

const scopes = {
  newsletters: 'https://www.googleapis.com/auth/gmail.readonly',
  calendar: 'https://www.googleapis.com/auth/calendar.events.readonly',
};
const expectedAccount = role => process.env[role === 'calendar' ? 'CALENDAR_ACCOUNT' : 'NEWSLETTER_ACCOUNT'];
function client() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.PUBLIC_URL) throw new Error('Google OAuth not configured');
  return new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, `${process.env.PUBLIC_URL}/oauth/callback`);
}
export async function startOAuth(store, role) {
  if (!scopes[role] || !expectedAccount(role)) throw new Error('Unknown OAuth role');
  const auth = client(), state = randomBytes(32).toString('hex');
  const verifier = randomBytes(48).toString('base64url');
  await store.write(`oauth/state-${state}`, seal({ role, verifier, expires: Date.now() + 600000 }));
  return auth.generateAuthUrl({
    scope: ['openid', 'email', scopes[role]], access_type: 'offline', prompt: 'consent',
    state, login_hint: expectedAccount(role),
    code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: 'S256',
  });
}
export async function finishOAuth(store, state, code) {
  if (!/^[a-f0-9]{64}$/.test(state || '') || typeof code !== 'string' || code.length > 4096) throw new Error('Invalid OAuth callback');
  const path = `oauth/state-${state}`, raw = await store.read(path);
  if (!raw) throw new Error('Unknown OAuth state');
  const saved = unseal(raw.toString());
  if (saved.expires < Date.now()) throw new Error('Expired OAuth state');
  const auth = client();
  const { tokens } = await auth.getToken({ code, codeVerifier: saved.verifier });
  const ticket = await auth.verifyIdToken({ idToken: tokens.id_token, audience: process.env.GOOGLE_CLIENT_ID });
  const identity = ticket.getPayload();
  if (!identity.email_verified || identity.email.toLowerCase() !== expectedAccount(saved.role).toLowerCase()) throw new Error('Unexpected Google account');
  if (!tokens.refresh_token) throw new Error('Offline access was not granted');
  if (!tokens.scope?.split(' ').includes(scopes[saved.role])) throw new Error('Required scope was not granted');
  await store.write(`oauth/${saved.role}`, seal({ refresh_token: tokens.refresh_token }), { overwrite: true });
  await store.remove(path);
  return saved.role;
}
async function apiClient(store, role) {
  const record = await store.read(`oauth/${role}`);
  if (!record) throw new Error(`Connect ${role} first`);
  const auth = client();
  auth.setCredentials(unseal(record.toString()));
  return auth;
}
function bodyText(part) {
  if (!part) return '';
  if (part.mimeType === 'text/plain' && part.body?.data) return Buffer.from(part.body.data, 'base64url').toString('utf8');
  if (part.mimeType === 'text/html' && part.body?.data) return convert(Buffer.from(part.body.data, 'base64url').toString('utf8'), { wordwrap: false });
  const children = part.parts || [];
  const plain = children.find(p => p.mimeType === 'text/plain');
  return plain ? bodyText(plain) : children.map(bodyText).join('\n');
}
export async function newsletters(store) {
  const senders = (process.env.NEWSLETTER_SENDERS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!senders.length || senders.length > 20 || senders.some(s => !/^[a-zA-Z0-9._+%-]+@[a-zA-Z0-9.-]+$/.test(s))) throw new Error('Configure newsletter sender allowlist');
  const auth = await apiClient(store, 'newsletters');
  const q = `newer_than:3d -in:spam -in:trash {${senders.map(s => `from:${s}`).join(' ')}}`;
  const { data } = await auth.request({ url: 'https://gmail.googleapis.com/gmail/v1/users/me/messages', params: { q, maxResults: 12 }, timeout: 15000 });
  const result = [];
  for (const item of data.messages || []) {
    const { data: mail } = await auth.request({ url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}`, params: { format: 'full' }, timeout: 15000 });
    const header = n => mail.payload.headers.find(h => h.name.toLowerCase() === n)?.value || '';
    result.push({ subject: header('subject').slice(0, 240), sender: header('from').slice(0, 180), text: bodyText(mail.payload).slice(0, 4000) });
  }
  return result;
}
export async function calendar(store, day) {
  const auth = await apiClient(store, 'calendar');
  const start = DateTime.fromISO(day, { zone: ZONE }).startOf('day');
  let pageToken, all = [];
  for (let page = 0; page < 5; page++) {
    const { data } = await auth.request({
      url: 'https://www.googleapis.com/calendar/v3/calendars/primary/events', timeout: 15000,
      params: { timeMin: start.toISO(), timeMax: start.plus({ days: 1 }).toISO(), singleEvents: true, orderBy: 'startTime', timeZone: ZONE, maxResults: 100, ...(pageToken ? { pageToken } : {}) },
    });
    all.push(...(data.items || []));
    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }
  if (pageToken) throw new Error('Calendar is larger than configured limit');
  return all.filter(e => e.status !== 'cancelled').map(e => ({
    title: (e.summary || 'Evento sin título').slice(0, 250),
    time: e.start.date ? 'Todo el día' : DateTime.fromISO(e.start.dateTime).setZone(ZONE).toFormat('HH:mm'),
    location: (e.location || '').slice(0, 180),
  }));
}
