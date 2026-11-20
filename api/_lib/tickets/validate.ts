import { parsePhoneNumberFromString } from 'libphonenumber-js';

export const normalizeEmail = (email: unknown) => (typeof email === 'string' ? email.trim().toLowerCase() : '');
export const isEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
export const cleanText = (v: unknown, max = 80) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');

/** Returns E.164 or null. Numbers without a country code are read as Greek. */
export function normalizePhone(input: unknown): string | null {
  if (typeof input !== 'string' || !input.trim()) return null;
  const parsed = parsePhoneNumberFromString(input.trim(), 'GR');
  return parsed?.isValid() ? parsed.number : null;
}

/** reCAPTCHA v3, only when RECAPTCHA_SECRET_KEY is set. */
export async function passesRecaptcha(token: unknown, ip: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== 'string' || !token) return false;
  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const body = (await res.json()) as { success: boolean; score?: number; action?: string };
    return body.success && (body.score ?? 0) >= 0.5 && body.action === 'ticket';
  } catch {
    // Don't turn Google being down into "nobody can sign up"; the honeypot and rate limit still apply.
    return true;
  }
}

const hits = new Map<string, { count: number; resetAt: number }>();
/** Best-effort per-instance limiter (Fluid Compute reuses instances, so it does catch bursts). */
export function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  return ++entry.count > max;
}
