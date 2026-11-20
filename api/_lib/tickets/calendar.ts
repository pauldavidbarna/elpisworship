import { ticketEvent, type Lang } from '../../../src/config/ticketEvent.js';

const utcStamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

function location(): string {
  return [ticketEvent.venue.name, ticketEvent.venue.address].filter(Boolean).join(', ');
}

export function googleCalendarUrl(lang: Lang, ticketPage: string): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: ticketEvent.title[lang],
    dates: `${utcStamp(ticketEvent.startsAt)}/${utcStamp(ticketEvent.endsAt)}`,
    location: location(),
    details: `${ticketEvent.subtitle[lang]}\n\n${ticketPage}`,
    ctz: ticketEvent.timeZone,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

const icsEscape = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, (c) => `\\${c}`);

export function icsFile(lang: Lang, code: string, ticketPage: string): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Elpis Worship//Tickets//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${ticketEvent.slug}-${code}@elpisworship.com`,
    `DTSTAMP:${utcStamp(new Date().toISOString())}`,
    `DTSTART:${utcStamp(ticketEvent.startsAt)}`,
    `DTEND:${utcStamp(ticketEvent.endsAt)}`,
    `SUMMARY:${icsEscape(ticketEvent.title[lang])}`,
    `LOCATION:${icsEscape(location())}`,
    `DESCRIPTION:${icsEscape(`${ticketEvent.subtitle[lang]}\n${ticketPage}`)}`,
    `URL:${ticketPage}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT3H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${icsEscape(ticketEvent.title[lang])}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
