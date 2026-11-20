import { ticketEvent, SITE_URL, type Lang } from '../../../src/config/ticketEvent.js';
import { ticketToken } from './token.js';
import type { TicketRow } from './db.js';

// Server-side copy for the email, PDF, ICS and SMS. The website itself uses i18next.
export const T = {
  en: {
    subject: (title: string) => `Your ticket · ${title}`,
    reminderSubject: (title: string) => `Tomorrow · ${title}`,
    greeting: (name: string) => `Hi ${name},`,
    confirmed: 'Your place is reserved. Show this QR code at the entrance.',
    reminder: 'See you tomorrow! Keep this QR code handy for the entrance.',
    admits: (n: number) => (n === 1 ? 'Admits 1 person' : `Admits ${n} people`),
    date: 'Date',
    time: 'Time',
    venue: 'Venue',
    code: 'Ticket code',
    viewTicket: 'View ticket',
    openMap: 'Open map',
    addCalendar: 'Add to calendar',
    cantCome: "Can't make it anymore? Reply to this email and we'll free up your seat for someone else.",
    pdfNote: 'Your ticket is also attached as a PDF.',
    free: 'Free entry · Personal ticket',
    sms: (title: string, time: string) => `Elpis Worship: ${title} is today at ${time}. Have your ticket QR ready at the entrance. See you there!`,
  },
  gr: {
    subject: (title: string) => `Το εισιτήριό σου · ${title}`,
    reminderSubject: (title: string) => `Αύριο · ${title}`,
    greeting: (name: string) => `Γεια σου ${name},`,
    confirmed: 'Η θέση σου είναι κλεισμένη. Δείξε αυτόν τον κωδικό QR στην είσοδο.',
    reminder: 'Τα λέμε αύριο! Έχε έτοιμο τον κωδικό QR για την είσοδο.',
    admits: (n: number) => (n === 1 ? 'Ισχύει για 1 άτομο' : `Ισχύει για ${n} άτομα`),
    date: 'Ημερομηνία',
    time: 'Ώρα',
    venue: 'Τοποθεσία',
    code: 'Κωδικός εισιτηρίου',
    viewTicket: 'Δες το εισιτήριο',
    openMap: 'Άνοιξε τον χάρτη',
    addCalendar: 'Προσθήκη στο ημερολόγιο',
    cantCome: 'Δεν μπορείς τελικά να έρθεις; Απάντησε σε αυτό το email και θα δώσουμε τη θέση σου σε κάποιον άλλον.',
    pdfNote: 'Το εισιτήριό σου επισυνάπτεται και ως PDF.',
    free: 'Δωρεάν είσοδος · Προσωπικό εισιτήριο',
    sms: (title: string, time: string) => `Elpis Worship: ${title} είναι σήμερα στις ${time}. Έχε έτοιμο το QR του εισιτηρίου σου. Τα λέμε εκεί!`,
  },
} as const;

const LOCALE: Record<Lang, string> = { en: 'en-GB', gr: 'el-GR' };

export function formatDate(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALE[lang], {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: ticketEvent.timeZone,
  }).format(new Date(iso));
}

export function formatTime(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALE[lang], { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: ticketEvent.timeZone }).format(new Date(iso));
}

export function timeRange(lang: Lang): string {
  return `${formatTime(ticketEvent.startsAt, lang)} – ${formatTime(ticketEvent.endsAt, lang)}`;
}

/** "Maria Popescu + 3 (Andrei, Ioana, Mihai)" */
export function holderLine(t: Pick<TicketRow, 'name' | 'guests' | 'guest_name'>): string {
  if (t.guests <= 1) return t.name;
  return t.guest_name ? `${t.name} + ${t.guests - 1} (${t.guest_name})` : `${t.name} + ${t.guests - 1}`;
}

export function siteUrl(): string {
  return (process.env.SITE_URL ?? SITE_URL).replace(/\/$/, '');
}

export function ticketUrls(code: string) {
  const token = ticketToken(code);
  const base = siteUrl();
  return {
    token,
    page: `${base}/ticket/${token}`,
    qr: `${base}/api/tickets?action=qr&t=${encodeURIComponent(token)}`,
  };
}
