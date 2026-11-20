import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarPlus, CheckCircle2, Download, MapPin, TicketX } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ticketEvent } from '@/config/ticketEvent';
import { eventLang, formatEventDate, formatEventTime, googleCalendarUrl } from '@/lib/tickets';

interface TicketData {
  code: string;
  name: string;
  guests: 1 | 2;
  guestName: string | null;
  checkedInAt: string | null;
  qr: string;
}

function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
}

const Ticket = () => {
  useNoIndex();
  const { token = '' } = useParams();
  const { t, i18n } = useTranslation();
  const lang = eventLang(i18n.language);
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'invalid'>('loading');

  useEffect(() => {
    document.title = `${t('tickets.ticket_title')} | Elpis Worship`;
  }, [t]);

  useEffect(() => {
    fetch(`/api/tickets?action=ticket&t=${encodeURIComponent(token)}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((body: (TicketData & { status: string }) | null) => {
        if (body?.status === 'ok') {
          setTicket(body);
          setState('ok');
        } else setState('invalid');
      })
      .catch(() => setState('invalid'));
  }, [token]);

  if (state === 'loading') {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (state === 'invalid' || !ticket) {
    return (
      <Layout>
        <section className="py-24 container mx-auto px-4 text-center max-w-md">
          <TicketX className="h-14 w-14 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-3xl font-semibold mb-3">{t('tickets.ticket_invalid_title')}</h1>
          <p className="text-muted-foreground">{t('tickets.ticket_invalid_text')}</p>
        </section>
      </Layout>
    );
  }

  const holder = ticket.guests === 2 ? `${ticket.name} + 1${ticket.guestName ? ` (${ticket.guestName})` : ''}` : ticket.name;

  return (
    <Layout>
      <section className="py-10 md:py-16 bg-muted/40">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="border-0 shadow-xl overflow-hidden">
            {ticketEvent.posterPath && (
              <div className="h-32 bg-secondary overflow-hidden">
                <img src={ticketEvent.artworkPath || ticketEvent.posterPath} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
            )}
            <CardContent className="p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">{ticketEvent.title[lang]}</p>
              <h1 className="font-display text-2xl md:text-3xl font-bold mt-1 break-words">{holder}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t(ticket.guests === 2 ? 'tickets.ticket_admits_2' : 'tickets.ticket_admits_1')}</p>

              {ticket.checkedInAt && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-primary/10 text-foreground px-3 py-2 text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {t('tickets.ticket_used', { time: formatEventTime(ticket.checkedInAt, lang) })}
                </div>
              )}

              <div className="my-6 flex flex-col items-center">
                <img src={ticket.qr} alt={`QR ${ticket.code}`} width={260} height={260} className="w-[260px] h-[260px] bg-white p-2 rounded-lg" />
                <p className="font-mono text-xl font-bold tracking-[0.2em] mt-2">{ticket.code}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('tickets.ticket_show')}</p>
              </div>

              <dl className="space-y-3 text-sm">
                <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">{t('tickets.date')}</dt><dd className="font-medium">{formatEventDate(ticketEvent.startsAt, lang)}</dd></div>
                <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">{t('tickets.time')}</dt><dd className="font-medium">{formatEventTime(ticketEvent.startsAt, lang)} – {formatEventTime(ticketEvent.endsAt, lang)}</dd></div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">{t('tickets.venue')}</dt>
                  <dd className="font-medium">{ticketEvent.venue.name}, {ticketEvent.venue.address}</dd>
                  {ticketEvent.venue.landmark && <dd className="text-muted-foreground">{ticketEvent.venue.landmark[lang]}</dd>}
                </div>
              </dl>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-6">
                <Button asChild variant="outline" size="sm">
                  <a href={ticketEvent.venue.mapsUrl} target="_blank" rel="noopener noreferrer"><MapPin className="h-4 w-4 mr-1.5" />{t('tickets.open_map')}</a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href={googleCalendarUrl(lang)} target="_blank" rel="noopener noreferrer"><CalendarPlus className="h-4 w-4 mr-1.5" />{t('tickets.add_calendar')}</a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href={`/api/tickets?action=pdf&t=${encodeURIComponent(token)}`}><Download className="h-4 w-4 mr-1.5" />PDF</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Ticket;
