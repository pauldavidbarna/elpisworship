import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

// No 0/O/1/I so codes read back unambiguously over the phone or from paper.
// 32 symbols, so a random byte masked to 5 bits picks one without bias.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_RE = /^[A-HJ-NP-Z2-9]{8}$/;
const SIG_LENGTH = 12;

function secret(): string {
  const s = process.env.TICKET_SECRET;
  if (!s || s.length < 16) throw new Error('TICKET_SECRET is missing or too short');
  return s;
}

function hmac(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function generateCode(): string {
  return Array.from(randomBytes(8), (b) => ALPHABET[b & 31]).join('');
}

export function signCode(code: string): string {
  return hmac(code).slice(0, SIG_LENGTH);
}

/** The value encoded in the QR and used in /ticket/<token> URLs. */
export function ticketToken(code: string): string {
  return `${code}.${signCode(code)}`;
}

/** Returns the code if the token's signature is valid, otherwise null. */
export function verifyTicketToken(token: string): string | null {
  const [code, sig, ...rest] = token.trim().split('.');
  if (rest.length || !code || !sig || !CODE_RE.test(code)) return null;
  return safeEqual(sig, signCode(code)) ? code : null;
}

/**
 * Accepts whatever a scanner or a person typed: a full ticket URL, a bare token,
 * or (for manual lookups) a plain code. Returns the token part, uppercased code.
 */
export function extractToken(input: string): string {
  const trimmed = input.trim();
  const fromUrl = trimmed.match(/\/ticket\/([^/?#\s]+)/);
  const raw = fromUrl ? decodeURIComponent(fromUrl[1]) : trimmed;
  const dot = raw.indexOf('.');
  return dot === -1 ? raw.toUpperCase() : raw.slice(0, dot).toUpperCase() + raw.slice(dot);
}

// ── Admin sessions ─────────────────────────────────────────────────────────
// Stateless: the token carries who signed in and when it expires, signed with the
// same secret. Every admin endpoint verifies it server-side.

const ADMIN_SESSION_MS = 16 * 60 * 60 * 1000;

export function checkAdminPassword(password: string): boolean {
  const expected = process.env.TICKETS_DOOR_PASSWORD;
  if (!expected) return false;
  return safeEqual(hmac(`pw:${password}`), hmac(`pw:${expected}`));
}

export function createAdminSession(name: string): string {
  const payload = Buffer.from(JSON.stringify({ n: name.slice(0, 40), exp: Date.now() + ADMIN_SESSION_MS })).toString('base64url');
  return `${payload}.${hmac(`admin:${payload}`)}`;
}

/** Returns the admin's display name if the session is valid, otherwise null. */
export function verifyAdminSession(header: string | undefined): string | null {
  const token = header?.replace(/^Bearer\s+/i, '') ?? '';
  const [payload, sig] = token.split('.');
  if (!payload || !sig || !safeEqual(sig, hmac(`admin:${payload}`))) return null;
  try {
    const { n, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { n: string; exp: number };
    return exp > Date.now() ? n || 'admin' : null;
  } catch {
    return null;
  }
}
