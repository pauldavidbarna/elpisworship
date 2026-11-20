import { Resend } from 'resend';
import { ticketEvent } from '../../../src/config/ticketEvent.js';
import type { TicketRow } from './db.js';
import { googleCalendarUrl, icsFile } from './calendar.js';
import { ticketPdf } from './pdf.js';
import { T, formatDate, holderLine, siteUrl, timeRange, ticketUrls } from './text.js';

const ACCENT = '#00c2cc';
const INK = '#111114';
const MUTED = '#6b6b75';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function button(href: string, label: string, primary = false): string {
  const bg = primary ? ACCENT : '#ffffff';
  const fg = primary ? '#ffffff' : INK;
  const border = primary ? ACCENT : '#d9d9de';
  return `<td style="padding:4px"><a href="${esc(href)}" style="display:inline-block;padding:11px 16px;border-radius:8px;border:1px solid ${border};background:${bg};color:${fg};font-weight:600;font-size:14px;text-decoration:none;white-space:nowrap">${esc(label)}</a></td>`;
}

/** Table-based layout: flex/grid break in Outlook and several webmail clients. */
export function ticketEmailHtml(ticket: TicketRow, kind: 'confirmation' | 'reminder' = 'confirmation'): string {
  const lang = ticket.lang;
  const t = T[lang];
  const { page, qr } = ticketUrls(ticket.code);
  // Gmail caches images by URL forever, so the deploy's commit is added to pick up a new poster.
  const version = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);
  const poster = ticketEvent.posterPath ? `${siteUrl()}${ticketEvent.posterPath}${version ? `?v=${version}` : ''}` : '';
  const landmark = ticketEvent.venue.landmark?.[lang];
  const detail = (label: string, value: string, extra = '') =>
    `<tr><td style="padding:0 0 12px"><div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${MUTED}">${esc(label)}</div><div style="font-size:15px;color:${INK};margin-top:2px">${esc(value)}</div>${extra}</td></tr>`;

  return `<!doctype html>
<html lang="${lang === 'gr' ? 'el' : 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(ticketEvent.title[lang])}</title></head>
<body style="margin:0;padding:0;background:#f2f3f5;font-family:'Noto Sans',Helvetica,Arial,sans-serif;color:${INK}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f3f5"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden">
${poster ? `<tr><td><img src="${esc(poster)}" width="520" alt="${esc(ticketEvent.title[lang])}" style="display:block;width:100%;height:auto;border:0"></td></tr>` : ''}
<tr><td style="padding:28px 28px 8px">
  <p style="margin:0 0 6px;font-size:15px">${esc(t.greeting(ticket.name.split(' ')[0]))}</p>
  <p style="margin:0;font-size:15px;line-height:1.5;color:${MUTED}">${esc(kind === 'reminder' ? t.reminder : t.confirmed)}</p>
</td></tr>
<tr><td style="padding:16px 28px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e6e6ea;border-radius:12px">
    <tr><td style="padding:22px 22px 6px">
      <div style="font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${ACCENT}">${esc(ticketEvent.title[lang])}</div>
      <div style="font-size:26px;line-height:1.2;font-weight:800;margin-top:6px">${esc(holderLine(ticket))}</div>
      <div style="font-size:13px;color:${MUTED};margin-top:4px">${esc(t.admits(ticket.guests))}</div>
    </td></tr>
    <tr><td align="center" style="padding:14px 22px 4px">
      <img src="${esc(qr)}" width="220" height="220" alt="QR ${esc(ticket.code)}" style="display:block;width:220px;height:220px;border:0">
      <div style="font-family:Menlo,Consolas,monospace;font-size:20px;font-weight:700;letter-spacing:.18em;margin-top:6px">${esc(ticket.code)}</div>
    </td></tr>
    <tr><td style="padding:18px 22px 6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${detail(t.date, formatDate(ticketEvent.startsAt, lang))}
      ${detail(t.time, timeRange(lang))}
      ${detail(t.venue, `${ticketEvent.venue.name}, ${ticketEvent.venue.address}`, landmark ? `<div style="font-size:13px;color:${MUTED};margin-top:2px">${esc(landmark)}</div>` : '')}
    </table></td></tr>
  </table>
</td></tr>
<tr><td align="center" style="padding:4px 24px 8px">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
    ${button(page, t.viewTicket, true)}
    ${button(ticketEvent.venue.mapsUrl, t.openMap)}
  </tr></table>
  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
    ${button(googleCalendarUrl(lang, page), t.addCalendar)}
  </tr></table>
</td></tr>
<tr><td style="padding:16px 28px 28px;font-size:13px;line-height:1.5;color:${MUTED}">
  ${kind === 'confirmation' ? `<p style="margin:0 0 10px">${esc(t.pdfNote)}</p>` : ''}
  <p style="margin:0">${esc(t.cantCome)}</p>
</td></tr>
</table>
<p style="font-size:12px;color:${MUTED};margin:16px 0 0">Elpis Worship · <a href="${siteUrl()}" style="color:${MUTED}">elpisworship.com</a></p>
</td></tr></table>
</body></html>`;
}

export function ticketEmailText(ticket: TicketRow, kind: 'confirmation' | 'reminder' = 'confirmation'): string {
  const lang = ticket.lang;
  const t = T[lang];
  const { page } = ticketUrls(ticket.code);
  return [
    t.greeting(ticket.name.split(' ')[0]),
    '',
    kind === 'reminder' ? t.reminder : t.confirmed,
    '',
    `${ticketEvent.title[lang]} — ${holderLine(ticket)}`,
    t.admits(ticket.guests),
    `${t.date}: ${formatDate(ticketEvent.startsAt, lang)}`,
    `${t.time}: ${timeRange(lang)}`,
    `${t.venue}: ${ticketEvent.venue.name}, ${ticketEvent.venue.address}`,
    `${t.code}: ${ticket.code}`,
    '',
    `${t.viewTicket}: ${page}`,
    `${t.openMap}: ${ticketEvent.venue.mapsUrl}`,
    '',
    t.cantCome,
  ].join('\n');
}

let resend: Resend | null = null;
const client = () => (resend ??= new Resend(process.env.RESEND_API_KEY));

// Must be an address on a domain verified in Resend; onboarding@resend.dev only
// delivers to the Resend account owner.
const from = () => process.env.TICKETS_FROM_EMAIL ?? 'Elpis Worship <tickets@elpisworship.com>';

export async function sendTicketEmail(ticket: TicketRow): Promise<void> {
  if (!ticket.email) return;
  const lang = ticket.lang;
  const { page } = ticketUrls(ticket.code);
  const pdf = await ticketPdf(ticket);
  const { error } = await client().emails.send({
    from: from(),
    to: ticket.email,
    replyTo: ticketEvent.replyTo,
    subject: T[lang].subject(ticketEvent.title[lang]),
    html: ticketEmailHtml(ticket),
    text: ticketEmailText(ticket),
    attachments: [
      { filename: `ticket-${ticket.code}.pdf`, content: Buffer.from(pdf) },
      { filename: 'event.ics', content: Buffer.from(icsFile(lang, ticket.code, page)), contentType: 'text/calendar; charset=utf-8; method=PUBLISH' },
    ],
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

/** Day-before reminders, sent in batches of up to 100 (Resend's batch limit). */
export async function sendReminderEmails(tickets: TicketRow[]): Promise<string[]> {
  const sent: string[] = [];
  const withEmail = tickets.filter((t) => t.email);
  for (let i = 0; i < withEmail.length; i += 100) {
    const chunk = withEmail.slice(i, i + 100);
    const { error } = await client().batch.send(
      chunk.map((ticket) => ({
        from: from(),
        to: ticket.email!,
        replyTo: ticketEvent.replyTo,
        subject: T[ticket.lang].reminderSubject(ticketEvent.title[ticket.lang]),
        html: ticketEmailHtml(ticket, 'reminder'),
        text: ticketEmailText(ticket, 'reminder'),
      })),
    );
    if (error) {
      console.error('Reminder batch failed', error.message);
      continue;
    }
    sent.push(...chunk.map((t) => t.id));
  }
  return sent;
}
