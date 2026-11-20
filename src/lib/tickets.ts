import { useEffect, useState } from 'react';
import { ticketEvent, type Lang } from '@/config/ticketEvent';

export const eventLang = (lng: string): Lang => (lng === 'en' ? 'en' : 'gr');

const LOCALE: Record<Lang, string> = { en: 'en-GB', gr: 'el-GR' };

export function formatEventDate(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALE[lang], {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: ticketEvent.timeZone,
  }).format(new Date(iso));
}

export function formatEventTime(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALE[lang], { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: ticketEvent.timeZone }).format(new Date(iso));
}

export function googleCalendarUrl(lang: Lang): string {
  const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: ticketEvent.title[lang],
    dates: `${stamp(ticketEvent.startsAt)}/${stamp(ticketEvent.endsAt)}`,
    location: `${ticketEvent.venue.name}, ${ticketEvent.venue.address}`,
    details: ticketEvent.subtitle[lang],
    ctz: ticketEvent.timeZone,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export interface TicketStats {
  enabled: boolean;
  capacity?: number;
  claimed?: number;
  remaining?: number;
  showCount?: boolean;
}

/** Live seat counter: polls every 15 s, but only while the tab is visible. */
export function useTicketStats(intervalMs = 15000) {
  const [stats, setStats] = useState<TicketStats | null>(null);

  useEffect(() => {
    if (!ticketEvent.enabled) return;
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    const load = () =>
      fetch('/api/tickets?action=stats', { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((s: TicketStats | null) => { if (s && !cancelled) setStats(s); })
        .catch(() => {});

    const start = () => {
      clearInterval(timer);
      if (document.visibilityState !== 'visible') return;
      load();
      timer = setInterval(load, intervalMs);
    };

    start();
    document.addEventListener('visibilitychange', start);
    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', start);
    };
  }, [intervalMs]);

  return { stats, setStats };
}

// reCAPTCHA v3 runs only when a site key is configured.
const RECAPTCHA_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
type Grecaptcha = { ready: (cb: () => void) => void; execute: (key: string, o: { action: string }) => Promise<string> };

export function loadRecaptcha(): void {
  if (!RECAPTCHA_KEY || document.getElementById('recaptcha-script')) return;
  const s = document.createElement('script');
  s.id = 'recaptcha-script';
  s.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_KEY}`;
  s.async = true;
  document.head.appendChild(s);
}

export async function recaptchaToken(): Promise<string | undefined> {
  const g = (window as unknown as { grecaptcha?: Grecaptcha }).grecaptcha;
  if (!RECAPTCHA_KEY || !g) return undefined;
  return new Promise((resolve) => g.ready(() => g.execute(RECAPTCHA_KEY, { action: 'ticket' }).then(resolve, () => resolve(undefined))));
}
