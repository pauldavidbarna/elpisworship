import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ticketEvent } from '../src/config/ticketEvent.js';
import { db, type TicketRow } from './_lib/tickets/db.js';
import { sendReminderEmails } from './_lib/tickets/email.js';
import { sendSms, smsEnabled } from './_lib/tickets/sms.js';
import { T, formatTime } from './_lib/tickets/text.js';

// Daily cron (vercel.json): the day before the event emails everyone who hasn't
// been reminded; on the day, texts holders with a phone number if Twilio is set up.

const dayInZone = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: ticketEvent.timeZone }).format(d); // YYYY-MM-DD

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel sends "Authorization: Bearer $CRON_SECRET" on cron invocations.
  if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!ticketEvent.enabled) return res.json({ skipped: 'disabled' });

  const now = new Date();
  const today = dayInZone(now);
  const tomorrow = dayInZone(new Date(now.getTime() + 24 * 60 * 60 * 1000));
  const eventDay = dayInZone(new Date(ticketEvent.startsAt));
  const result: Record<string, number> = {};

  try {
    if (eventDay === tomorrow) {
      const { data, error } = await db()
        .from('event_tickets')
        .select('*')
        .eq('event_slug', ticketEvent.slug)
        .is('reminder_email_sent_at', null)
        .is('checked_in_at', null)
        .not('email', 'is', null);
      if (error) throw new Error(error.message);
      const sentIds = await sendReminderEmails((data ?? []) as TicketRow[]);
      if (sentIds.length) {
        await db().from('event_tickets').update({ reminder_email_sent_at: now.toISOString() } as never).in('id', sentIds);
      }
      result.emails = sentIds.length;
    }

    if (eventDay === today && smsEnabled()) {
      const { data, error } = await db()
        .from('event_tickets')
        .select('*')
        .eq('event_slug', ticketEvent.slug)
        .is('reminder_sms_sent_at', null)
        .is('checked_in_at', null)
        .not('phone', 'is', null);
      if (error) throw new Error(error.message);
      let sent = 0;
      for (const t of (data ?? []) as TicketRow[]) {
        try {
          await sendSms(t.phone!, T[t.lang].sms(ticketEvent.title[t.lang], formatTime(ticketEvent.startsAt, t.lang)));
          await db().from('event_tickets').update({ reminder_sms_sent_at: new Date().toISOString() } as never).eq('id', t.id);
          sent++;
        } catch (err) {
          console.error('SMS reminder failed', t.code, err instanceof Error ? err.message : err);
        }
      }
      result.sms = sent;
    }

    return res.json({ today, eventDay, ...result });
  } catch (err) {
    console.error('tickets-cron failed', err instanceof Error ? err.message : err);
    return res.status(500).json({ error: 'Server error' });
  }
}
