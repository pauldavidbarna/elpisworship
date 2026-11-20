import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, CalendarPlus, Clock, Instagram, MapPin, MailCheck, Minus, Plus, Ticket as TicketIcon, Users } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PopIn, RevealText } from '@/components/motion';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ticketEvent } from '@/config/ticketEvent';
import { EASE_OUT } from '@/lib/motion';
import {
  eventLang, formatEventDate, formatEventTime, googleCalendarUrl, loadRecaptcha, recaptchaToken, useTicketStats,
} from '@/lib/tickets';

type Field = 'name' | 'email' | 'phone' | 'guests' | 'gdpr' | 'recaptcha';
type Outcome =
  | { kind: 'ok' | 'resent'; email: string; emailSent: boolean }
  | { kind: 'full' | 'closed' };

function AnimatedNumber({ value }: { value: number }) {
  return (
    <span className="relative inline-flex overflow-hidden align-bottom tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function SeatCounter({ remaining, capacity, showCount }: { remaining: number; capacity: number; showCount: boolean }) {
  const { t } = useTranslation();
  const claimedPct = Math.min(100, ((capacity - remaining) / capacity) * 100);
  if (remaining === 0) {
    return <p className="font-display text-2xl font-semibold text-center">{t('tickets.sold_out_badge')}</p>;
  }
  if (!showCount) {
    return <p className="text-center font-medium">{t('tickets.limited', { capacity })}</p>;
  }
  // Split the sentence around the number so the number alone can animate.
  const [before, after] = t('tickets.remaining', { remaining: '\u0000', capacity }).split('\u0000');
  return (
    <div aria-live="polite">
      <p className="text-center font-medium mb-3">
        {before}<AnimatedNumber value={remaining} />{after}
      </p>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={false}
          animate={{ width: `${claimedPct}%` }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
        />
      </div>
    </div>
  );
}

const Tickets = () => {
  const { t, i18n } = useTranslation();
  const lang = eventLang(i18n.language);
  usePageMeta(ticketEvent.title[lang], t('tickets.meta_description'));
  const { stats, setStats } = useTicketStats();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [guests, setGuests] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [gdpr, setGdpr] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [website, setWebsite] = useState(''); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<Field | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  useEffect(() => {
    if (ticketEvent.enabled) loadRecaptcha();
  }, []);

  const soldOut = stats?.enabled && stats.remaining === 0;
  // The stepper never offers more people than there are seats left.
  const maxGroup = Math.max(1, Math.min(ticketEvent.maxGroupSize, stats?.remaining ?? ticketEvent.maxGroupSize));
  useEffect(() => {
    if (guests > maxGroup) setGuests(maxGroup);
  }, [guests, maxGroup]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);
    setFormError(null);
    if (!gdpr) return setFieldError('gdpr');
    setSubmitting(true);
    try {
      const res = await fetch('/api/tickets?action=claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone, guests, guestName, gdpr, newsletter, website, lang,
          recaptcha: await recaptchaToken(),
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { status?: string; field?: Field; emailSent?: boolean; remaining?: number };
      if (body.status === 'invalid' && body.field) return setFieldError(body.field);
      if (res.status === 429) return setFormError(t('tickets.err_rate'));
      if (body.status === 'ok' || body.status === 'resent') {
        setOutcome({ kind: body.status, email: email.trim().toLowerCase(), emailSent: body.emailSent !== false });
        if (body.status === 'ok' && stats?.remaining) setStats({ ...stats, claimed: (stats.claimed ?? 0) + guests, remaining: Math.max(0, stats.remaining - guests) });
        return;
      }
      if (body.status === 'full') {
        setOutcome({ kind: 'full' });
        if (stats) setStats({ ...stats, remaining: 0 });
        return;
      }
      if (body.status === 'not_enough' && body.remaining != null) {
        if (stats) setStats({ ...stats, remaining: body.remaining });
        return setFormError(`${t('tickets.not_enough_title')}. ${t('tickets.not_enough_text', { count: body.remaining })}`);
      }
      if (body.status === 'closed') return setOutcome({ kind: 'closed' });
      setFormError(t('tickets.err_generic'));
    } catch {
      setFormError(t('tickets.err_generic'));
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setName(''); setEmail(''); setPhone(''); setGuests(1); setGuestName('');
    setGdpr(false); setNewsletter(false); setOutcome(null);
  };

  const errorText = (f: Field) => (fieldError === f ? <p className="text-sm text-destructive mt-1">{t(`tickets.err_${f}`)}</p> : null);

  const details = [
    { icon: Calendar, label: t('tickets.date'), value: formatEventDate(ticketEvent.startsAt, lang) },
    { icon: Clock, label: t('tickets.time'), value: `${formatEventTime(ticketEvent.startsAt, lang)} – ${formatEventTime(ticketEvent.endsAt, lang)}` },
    { icon: MapPin, label: t('tickets.venue'), value: `${ticketEvent.venue.name}, ${ticketEvent.venue.address}`, extra: ticketEvent.venue.landmark?.[lang] },
  ];

  // ?preview shows the full page while it's still hidden; the API keeps refusing sign-ups.
  const preview = new URLSearchParams(window.location.search).has('preview');

  if (!ticketEvent.enabled && !preview) {
    return (
      <Layout>
        <section className="py-28 md:py-40 hero-gradient text-white">
          <div className="container mx-auto px-4 text-center max-w-xl">
            <PopIn trigger="mount" className="mb-6"><TicketIcon className="h-14 w-14 text-primary" /></PopIn>
            <RevealText as="h1" trigger="mount" text={t('tickets.coming_soon_title')} className="font-display text-[36px] md:text-[52px] font-semibold mb-4" />
            <p className="text-white/70 mb-8">{t('tickets.coming_soon_text')}</p>
            <Button asChild>
              <a href="https://instagram.com/elpisworship" target="_blank" rel="noopener noreferrer"><Instagram className="h-4 w-4 mr-2" />Instagram</a>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-12 pb-16 md:pt-20 md:pb-24 hero-gradient text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-10 md:gap-14 items-center max-w-5xl mx-auto">
            {ticketEvent.posterPath && (
              <motion.img
                src={ticketEvent.posterPath}
                alt={ticketEvent.title[lang]}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE_OUT }}
                className="w-full max-w-sm mx-auto rounded-2xl shadow-2xl"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
            <div>
              <RevealText as="h1" trigger="mount" text={ticketEvent.title[lang]} className="font-display text-[36px] md:text-[56px] leading-tight font-semibold mb-3" />
              <p className="text-white/70 text-lg mb-8">{ticketEvent.subtitle[lang]}</p>
              <ul className="space-y-4 mb-8">
                {details.map(({ icon: Icon, label, value, extra }) => (
                  <li key={label} className="flex gap-3">
                    <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-white/50">{label}</p>
                      <p className="font-medium">{value}</p>
                      {extra && <p className="text-sm text-white/60">{extra}</p>}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="secondary" size="sm">
                  <a href={ticketEvent.venue.mapsUrl} target="_blank" rel="noopener noreferrer"><MapPin className="h-4 w-4 mr-1.5" />{t('tickets.open_map')}</a>
                </Button>
                <Button asChild variant="secondary" size="sm">
                  <a href={googleCalendarUrl(lang)} target="_blank" rel="noopener noreferrer"><CalendarPlus className="h-4 w-4 mr-1.5" />{t('tickets.add_calendar')}</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-xl">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6 md:p-8">
              {stats?.enabled && stats.capacity != null && stats.remaining != null && (
                <div className="mb-8">
                  <SeatCounter remaining={stats.remaining} capacity={stats.capacity} showCount={!!stats.showCount} />
                </div>
              )}

              {outcome?.kind === 'ok' || outcome?.kind === 'resent' ? (
                <div className="text-center py-4">
                  <PopIn trigger="mount" className="mb-4"><MailCheck className="h-14 w-14 text-primary" /></PopIn>
                  <h2 className="font-display text-2xl font-semibold mb-3">
                    {t(outcome.kind === 'ok' ? 'tickets.success_title' : 'tickets.resent_title')}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {outcome.emailSent
                      ? t(outcome.kind === 'ok' ? 'tickets.success_text' : 'tickets.resent_text', { email: outcome.email })
                      : t('tickets.email_failed')}
                  </p>
                  {!soldOut && <Button variant="outline" onClick={reset}>{t('tickets.another')}</Button>}
                </div>
              ) : soldOut || outcome?.kind === 'full' ? (
                <div className="text-center py-4">
                  <h2 className="font-display text-2xl font-semibold mb-3">{t('tickets.full_title')}</h2>
                  <p className="text-muted-foreground mb-6">{t('tickets.full_text')}</p>
                  <Button asChild>
                    <a href="https://instagram.com/elpisworship" target="_blank" rel="noopener noreferrer"><Instagram className="h-4 w-4 mr-2" />Instagram</a>
                  </Button>
                </div>
              ) : outcome?.kind === 'closed' ? (
                <p className="text-center text-muted-foreground py-6">{t('tickets.closed_text')}</p>
              ) : (
                <form onSubmit={submit} noValidate className="space-y-5">
                  <div>
                    <h2 className="font-display text-2xl font-semibold mb-1">{t('tickets.form_title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('tickets.form_subtitle', { max: ticketEvent.maxGroupSize })}</p>
                  </div>

                  {/* Honeypot: hidden from people and assistive tech, irresistible to bots. */}
                  <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                    <label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} name="website" /></label>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="t-name">{t('tickets.name')}</Label>
                    <Input id="t-name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} aria-invalid={fieldError === 'name'} />
                    {errorText('name')}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="t-email">{t('tickets.email')}</Label>
                    <Input id="t-email" type="email" inputMode="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={fieldError === 'email'} />
                    {errorText('email')}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="t-phone">{t('tickets.phone')}</Label>
                    <Input id="t-phone" type="tel" inputMode="tel" autoComplete="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={fieldError === 'phone'} placeholder="69X XXX XXXX" />
                    {errorText('phone') ?? <p className="text-xs text-muted-foreground">{t('tickets.phone_hint')}</p>}
                  </div>

                  <fieldset>
                    <legend className="text-sm font-medium mb-2">{t('tickets.who')}</legend>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" size="icon" className="h-12 w-12 shrink-0" onClick={() => setGuests((g) => Math.max(1, g - 1))} disabled={guests <= 1} aria-label="−1">
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="flex-1 h-12 flex items-center justify-center gap-2 rounded-md border border-primary bg-primary/10 font-medium tabular-nums" aria-live="polite">
                        <Users className="h-4 w-4" />
                        {t('tickets.people', { count: guests })}
                      </div>
                      <Button type="button" variant="outline" size="icon" className="h-12 w-12 shrink-0" onClick={() => setGuests((g) => Math.min(maxGroup, g + 1))} disabled={guests >= maxGroup} aria-label="+1">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {errorText('guests')}
                  </fieldset>
                  {guests > 1 && (
                    <div className="space-y-1.5">
                      <Label htmlFor="t-guest">{t('tickets.guest_name')}</Label>
                      <Input id="t-guest" value={guestName} onChange={(e) => setGuestName(e.target.value)} maxLength={300} />
                      <p className="text-xs text-muted-foreground">{t('tickets.guest_name_hint')}</p>
                    </div>
                  )}

                  <div className="space-y-3 pt-1">
                    <label className="flex items-start gap-3 text-sm leading-snug cursor-pointer">
                      <Checkbox checked={gdpr} onCheckedChange={(v) => setGdpr(v === true)} className="mt-0.5" aria-invalid={fieldError === 'gdpr'} />
                      <span>
                        <Trans i18nKey="tickets.gdpr" components={{ privacy: <Link to="/privacy" className="underline hover:text-primary" target="_blank" /> }} />
                      </span>
                    </label>
                    {errorText('gdpr')}
                    <label className="flex items-start gap-3 text-sm leading-snug cursor-pointer text-muted-foreground">
                      <Checkbox checked={newsletter} onCheckedChange={(v) => setNewsletter(v === true)} className="mt-0.5" />
                      <span>{t('tickets.newsletter')}</span>
                    </label>
                  </div>

                  {errorText('recaptcha')}
                  {formError && <p className="text-sm text-destructive">{formError}</p>}

                  <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                    <TicketIcon className="h-4 w-4 mr-2" />
                    {submitting ? t('tickets.submitting') : t('tickets.submit')}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Tickets;
