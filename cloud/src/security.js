import { createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from 'node:crypto';

export function equalSecret(actual, expected) {
  if (typeof actual !== 'string' || typeof expected !== 'string' || expected.length < 32) return false;
  const a = Buffer.from(actual), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function encryptionKey() {
  const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'base64');
  if (key.length !== 32) throw new Error('Encryption key is not configured');
  return key;
}

export function seal(value, key = encryptionKey()) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString('base64url');
}

export function unseal(value, key = encryptionKey()) {
  const b = Buffer.from(value, 'base64url');
  if (b.length < 29) throw new Error('Invalid encrypted record');
  const cipher = createDecipheriv('aes-256-gcm', key, b.subarray(0, 12));
  cipher.setAuthTag(b.subarray(12, 28));
  return JSON.parse(Buffer.concat([cipher.update(b.subarray(28)), cipher.final()]).toString('utf8'));
}

export function safePath(path) {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_./-]{0,180}$/.test(path) || path.split('/').some(p => !p || p === '.' || p === '..')) {
    throw new Error('Invalid storage path');
  }
  return path;
}
