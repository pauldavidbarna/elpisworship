import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ticketEvent } from '../src/config/ticketEvent.js';
import { claimWithFreshCode, countTickets, db, findTicketByCode, type TicketRow } from './_lib/tickets/db.js';
import { sendTicketEmail } from './_lib/tickets/email.js';
import { syncTicketHolder } from './_lib/tickets/marketing.js';
import { checkAdminPassword, createAdminSession, extractToken, generateCode, verifyAdminSession, verifyTicketToken } from './_lib/tickets/token.js';
import { cleanText, isEmail, normalizeEmail, normalizePhone, parseGroupSize, rateLimited } from './_lib/tickets/validate.js';

// Admin ticket actions. Every action except login verifies the signed admin session
// here on the server; the admin UI being hidden is not the protection.

type Body = Record<string, unknown>;

const id = (b: Body) => (typeof b.id === 'string' ? b.id : '');

async function scan(b: Body) {
  // Anything without a valid signature is rejected before touching the database.
  const code = verifyTicketToken(extractToken(String(b.input ?? '')));
  if (!code) return { result: 'invalid' as const };
  const ticket = await findTicketByCode(code);
  if (!ticket || ticket.event_slug !== ticketEvent.slug) return { result: 'invalid' as const };
  return { result: ticket.checked_in_at ? ('used' as const) : ('ok' as const), ticket };
}

async function checkIn(b: Body, admin: string) {
  // The "is null" guard makes a double tap (or two doors scanning at once) harmless.
  const { data, error } = await db()
    .from('event_tickets')
    .update({ checked_in_at: new Date().toISOString(), checked_in_by: admin } as never)
    .eq('id', id(b))
    .eq('event_slug', ticketEvent.slug)
    .is('checked_in_at', null)
    .select('*')
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (data) return { result: 'ok' as const, ticket: data as TicketRow };
  const { data: current } = await db().from('event_tickets').select('*').eq('id', id(b)).maybeSingle();
  return current ? { result: 'used' as const, ticket: current as TicketRow } : { result: 'invalid' as const };
}

async function undoCheckIn(b: Body) {
  const { data, error } = await db()
    .from('event_tickets')
    .update({ checked_in_at: null, checked_in_by: null } as never)
    .eq('id', id(b))
    .eq('event_slug', ticketEvent.slug)
    .select('*')
    .maybeSingle();
  if (error) throw new Error(error.message);
  return { ticket: data as TicketRow | null };
}

async function list() {
  const { data, error } = await db()
    .from('event_tickets')
    .select('*')
    .eq('event_slug', ticketEvent.slug)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  const counts = await countTickets(ticketEvent.slug);
  return { tickets: (data ?? []) as TicketRow[], stats: { ...counts, capacity: ticketEvent.capacity }, slug: ticketEvent.slug, enabled: ticketEvent.enabled };
}

async function addManual(b: Body) {
  const name = cleanText(b.name);
  const email = normalizeEmail(b.email) || null;
  const phone = typeof b.phone === 'string' && b.phone.trim() ? normalizePhone(b.phone) : null;
  if (name.length < 2) return { status: 'invalid', field: 'name' };
  if (email && !isEmail(email)) return { status: 'invalid', field: 'email' };
  if (typeof b.phone === 'string' && b.phone.trim() && !phone) return { status: 'invalid', field: 'phone' };
  const guests = parseGroupSize(b.guests, ticketEvent.maxGroupSize);
  if (!guests) return { status: 'invalid', field: 'guests' };
  const result = await claimWithFreshCode(
    {
      slug: ticketEvent.slug,
      capacity: ticketEvent.capacity,
      name,
      email,
      phone,
      guests,
      guestName: guests > 1 ? cleanText(b.guestName, 300) || null : null,
      newsletter: false,
      lang: b.lang === 'en' ? 'en' : 'gr',
      source: 'manual',
    },
    generateCode,
  );
  if (!result.ok) return { status: result.reason, remaining: result.reason === 'not_enough' ? result.remaining : undefined };
  let emailSent = false;
  if (email && b.sendEmail === true) {
    try {
      await sendTicketEmail(result.ticket);
      emailSent = true;
    } catch (err) {
      console.error('Manual ticket email failed', err instanceof Error ? err.message : err);
    }
    await syncTicketHolder(result.ticket);
  }
  return { status: 'ok', ticket: result.ticket, emailSent };
}

async function resend(b: Body) {
  const { data } = await db().from('event_tickets').select('*').eq('id', id(b)).maybeSingle();
  const ticket = data as TicketRow | null;
  if (!ticket?.email) return { status: 'no_email' };
  await sendTicketEmail(ticket);
  return { status: 'ok' };
}

// Sends a sample confirmation to check how it looks. The ticket isn't saved, so its
// QR code won't pass check-in.
async function testEmail(b: Body) {
  const email = normalizeEmail(b.email);
  if (!isEmail(email)) return { status: 'invalid', field: 'email' };
  const guests = parseGroupSize(b.guests ?? 1, ticketEvent.maxGroupSize) ?? 1;
  const sample: TicketRow = {
    id: 'sample', event_slug: ticketEvent.slug, code: generateCode(),
    name: cleanText(b.name, 80) || 'Elpis Worship', email, phone: null, guests,
    guest_name: guests > 1 ? cleanText(b.guestName, 200) || null : null,
    newsletter_consent: false, lang: b.lang === 'en' ? 'en' : 'gr', source: 'manual',
    checked_in_at: null, checked_in_by: null, reminder_email_sent_at: null, reminder_sms_sent_at: null,
    created_at: new Date().toISOString(),
  };
  await sendTicketEmail(sample);
  return { status: 'ok' };
}

async function remove(b: Body) {
  const { error } = await db().from('event_tickets').delete().eq('id', id(b)).eq('event_slug', ticketEvent.slug);
  if (error) throw new Error(error.message);
  return { status: 'ok' };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const b = (req.body ?? {}) as Body;
  const action = String(b.action ?? '');

  try {
    if (action === 'login') {
      const ip = ((req.headers['x-forwarded-for'] as string) ?? '').split(',')[0].trim();
      if (rateLimited(`admin-login:${ip}`, 10, 15 * 60 * 1000)) return res.status(429).json({ error: 'Too many attempts' });
      if (!checkAdminPassword(String(b.password ?? ''))) return res.status(401).json({ error: 'Wrong password' });
      return res.json({ token: createAdminSession(cleanText(b.name, 40) || 'admin') });
    }

    const admin = verifyAdminSession(req.headers.authorization);
    if (!admin) return res.status(401).json({ error: 'Unauthorized' });

    switch (action) {
      case 'list':    return res.json(await list());
      case 'scan':    return res.json(await scan(b));
      case 'checkin': return res.json(await checkIn(b, admin));
      case 'undo':    return res.json(await undoCheckIn(b));
      case 'add':     return res.json(await addManual(b));
      case 'resend':  return res.json(await resend(b));
      case 'delete':  return res.json(await remove(b));
      case 'test_email': return res.json(await testEmail(b));
      default:        return res.status(404).json({ error: 'Unknown action' });
    }
  } catch (err) {
    console.error(`tickets-admin ${action} failed`, err instanceof Error ? err.message : err);
    return res.status(500).json({ error: 'Server error' });
  }
}
