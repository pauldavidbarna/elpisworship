import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ticketEvent } from '../src/config/ticketEvent.js';
import { claimWithFreshCode, countTickets, db, findTicketByCode, type TicketRow } from './_lib/tickets/db.js';
import { sendTicketEmail } from './_lib/tickets/email.js';
import { syncTicketHolder } from './_lib/tickets/marketing.js';
import { ticketPdf } from './_lib/tickets/pdf.js';
import { qrPng } from './_lib/tickets/qr.js';
import { ticketUrls } from './_lib/tickets/text.js';
import { generateCode, verifyTicketToken } from './_lib/tickets/token.js';
import { cleanText, isEmail, normalizeEmail, normalizePhone, parseGroupSize, passesRecaptcha, rateLimited } from './_lib/tickets/validate.js';

// Public ticket endpoints, one function to stay well inside the Hobby function limit:
//   GET  ?action=stats            live seat counter
//   POST ?action=claim            sign up
//   GET  ?action=ticket&t=<token> ticket page data
//   GET  ?action=qr&t=<token>     QR PNG (linked from the email; data URIs are blocked by Gmail)
//   GET  ?action=pdf&t=<token>    PDF download

const clientIp = (req: VercelRequest) => ((req.headers['x-forwarded-for'] as string) ?? '').split(',')[0].trim() || 'unknown';
const tokenParam = (req: VercelRequest) => (typeof req.query.t === 'string' ? req.query.t : '');

async function ticketFromToken(req: VercelRequest): Promise<TicketRow | null> {
  const code = verifyTicketToken(tokenParam(req));
  if (!code) return null;
  const ticket = await findTicketByCode(code);
  return ticket && ticket.event_slug === ticketEvent.slug ? ticket : null;
}

async function stats(res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (!ticketEvent.enabled) return res.json({ enabled: false });
  // Capacity counts people, so a group ticket takes as many seats as it admits.
  const { people } = await countTickets(ticketEvent.slug);
  return res.json({
    enabled: true,
    capacity: ticketEvent.capacity,
    claimed: people,
    remaining: Math.max(0, ticketEvent.capacity - people),
    maxGroupSize: ticketEvent.maxGroupSize,
    showCount: people >= ticketEvent.showCountAfter,
  });
}

async function claim(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (!ticketEvent.enabled) return res.status(403).json({ status: 'closed' });
  const body = (req.body ?? {}) as Record<string, unknown>;

  // Honeypot: a hidden field people never see. Pretend it worked so bots don't adapt.
  if (cleanText(body.website)) return res.json({ status: 'ok', emailSent: true });

  const ip = clientIp(req);
  if (rateLimited(`claim:${ip}`, 8, 10 * 60 * 1000)) return res.status(429).json({ status: 'rate_limited' });

  const name = cleanText(body.name);
  const email = normalizeEmail(body.email);
  const phone = normalizePhone(body.phone);
  const guests = parseGroupSize(body.guests, ticketEvent.maxGroupSize);
  const guestName = guests && guests > 1 ? cleanText(body.guestName, 300) || null : null;
  const lang = body.lang === 'en' ? 'en' : 'gr';

  if (name.length < 2) return res.status(400).json({ status: 'invalid', field: 'name' });
  if (!isEmail(email)) return res.status(400).json({ status: 'invalid', field: 'email' });
  if (!phone) return res.status(400).json({ status: 'invalid', field: 'phone' });
  if (!guests) return res.status(400).json({ status: 'invalid', field: 'guests' });
  if (body.gdpr !== true) return res.status(400).json({ status: 'invalid', field: 'gdpr' });
  if (!(await passesRecaptcha(body.recaptcha, ip))) return res.status(400).json({ status: 'invalid', field: 'recaptcha' });

  const result = await claimWithFreshCode(
    { slug: ticketEvent.slug, capacity: ticketEvent.capacity, name, email, phone, guests, guestName, newsletter: body.newsletter === true, lang, source: 'public' },
    generateCode,
  );

  if (!result.ok && result.reason === 'full') return res.json({ status: 'full' });
  if (!result.ok && result.reason === 'not_enough') return res.json({ status: 'not_enough', remaining: result.remaining });

  if (!result.ok) {
    // Already signed up: send the existing ticket again rather than erroring. The
    // ticket only ever goes to the address on file, so this leaks nothing.
    if (rateLimited(`resend:${email}`, 3, 60 * 60 * 1000)) return res.json({ status: 'resent', emailSent: true });
    const { data } = await db().from('event_tickets').select('*').eq('event_slug', ticketEvent.slug).eq('email', email).maybeSingle();
    let emailSent = false;
    if (data) {
      try {
        await sendTicketEmail(data as TicketRow);
        emailSent = true;
      } catch (err) {
        console.error('Ticket resend failed', err instanceof Error ? err.message : err);
      }
    }
    return res.json({ status: 'resent', emailSent });
  }

  let emailSent = false;
  try {
    await sendTicketEmail(result.ticket);
    emailSent = true;
  } catch (err) {
    console.error('Ticket email failed', result.ticket.code, err instanceof Error ? err.message : err);
  }
  await syncTicketHolder(result.ticket);
  return res.json({ status: 'ok', emailSent });
}

async function ticket(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');
  const t = await ticketFromToken(req);
  if (!t) return res.status(404).json({ status: 'invalid' });
  return res.json({
    status: 'ok',
    code: t.code,
    name: t.name,
    guests: t.guests,
    guestName: t.guest_name,
    lang: t.lang,
    checkedInAt: t.checked_in_at,
    qr: ticketUrls(t.code).qr,
  });
}

async function qr(req: VercelRequest, res: VercelResponse) {
  // Only needs a valid signature, not a DB hit: the image is the same forever.
  const token = tokenParam(req);
  const code = verifyTicketToken(token);
  if (!code) return res.status(404).send('Not found');
  const png = await qrPng(ticketUrls(code).page);
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  return res.send(png);
}

async function pdf(req: VercelRequest, res: VercelResponse) {
  const t = await ticketFromToken(req);
  if (!t) return res.status(404).send('Not found');
  const bytes = await ticketPdf(t);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="ticket-${t.code}.pdf"`);
  res.setHeader('Cache-Control', 'private, no-store');
  return res.send(Buffer.from(bytes));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = req.query.action;
  try {
    if (req.method === 'GET' && action === 'stats') return await stats(res);
    if (req.method === 'POST' && action === 'claim') return await claim(req, res);
    if (req.method === 'GET' && action === 'ticket') return await ticket(req, res);
    if (req.method === 'GET' && action === 'qr') return await qr(req, res);
    if (req.method === 'GET' && action === 'pdf') return await pdf(req, res);
    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error(`tickets ${String(action)} failed`, err instanceof Error ? err.message : err);
    return res.status(500).json({ status: 'error' });
  }
}
