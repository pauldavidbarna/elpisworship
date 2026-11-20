import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, LogOut, Mail, Plus, RefreshCw, ScanLine, Search, Trash2, Undo2, UserCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ticketEvent } from '@/config/ticketEvent';
import {
  downloadCsv, holderLine, matchesQuery, timeOf, useTicketsAdmin, type AdminStats, type AdminTicket,
} from '@/lib/ticketsAdmin';
import TicketsLogin from './TicketsLogin';

interface ListResponse {
  tickets: AdminTicket[];
  stats: AdminStats;
  slug: string;
  enabled: boolean;
}

function AddGuestDialog({ open, onOpenChange, onAdd }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (p: Record<string, unknown>) => Promise<string | null>;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [guests, setGuests] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) { setName(''); setEmail(''); setPhone(''); setGuests(1); setGuestName(''); setSendEmail(true); setError(''); }
  }, [open]);

  const save = async () => {
    setBusy(true);
    setError('');
    const err = await onAdd({ name, email, phone, guests, guestName, sendEmail });
    setBusy(false);
    if (err) setError(err);
    else onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add guest manually</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2">For artists, press, sponsors. Uses real seats from the capacity.</p>
        <div className="space-y-3 py-2">
          <div className="space-y-1"><Label>Name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-1"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="space-y-1"><Label>Phone</Label><Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div className="space-y-1">
            <Label>People, including them</Label>
            <Input type="number" min={1} max={ticketEvent.maxGroupSize} value={guests} onChange={(e) => setGuests(Math.min(ticketEvent.maxGroupSize, Math.max(1, Number(e.target.value) || 1)))} />
          </div>
          {guests > 1 && <div className="space-y-1"><Label>Names of the others</Label><Input value={guestName} onChange={(e) => setGuestName(e.target.value)} /></div>}
          {email && <label className="flex items-center gap-2 text-sm"><Checkbox checked={sendEmail} onCheckedChange={(v) => setSendEmail(v === true)} /> Email them the ticket</label>}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={busy || name.trim().length < 2}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function TicketsAdmin() {
  const { token, login, logout, call } = useTicketsAdmin();
  const [data, setData] = useState<ListResponse | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await call<ListResponse>('list'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [call]);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  const filtered = useMemo(() => (data?.tickets ?? []).filter((t) => matchesQuery(t, query)), [data, query]);

  if (!token) return <TicketsLogin onLogin={login} />;

  const act = async (ticket: AdminTicket, action: 'checkin' | 'undo' | 'resend' | 'delete') => {
    if (action === 'delete' && !confirm(`Delete the ticket of ${holderLine(ticket)}? This frees the seat.`)) return;
    if (action === 'undo' && !confirm(`Undo the check-in of ${holderLine(ticket)}?`)) return;
    setBusyId(ticket.id);
    try {
      const res = await call<{ status?: string }>(action, { id: ticket.id });
      if (action === 'resend') alert(res.status === 'ok' ? `Ticket re-sent to ${ticket.email}` : 'This guest has no email address.');
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setBusyId(null);
    }
  };

  const add = async (payload: Record<string, unknown>): Promise<string | null> => {
    try {
      const res = await call<{ status: string; field?: string; emailSent?: boolean; remaining?: number }>('add', payload);
      if (res.status === 'full') return 'All seats are taken. Delete a ticket first, or raise the capacity in the config.';
      if (res.status === 'not_enough') return `Only ${res.remaining} seat(s) left.`;
      if (res.status === 'duplicate') return 'This email already has a ticket.';
      if (res.status === 'invalid') return `Invalid ${res.field}.`;
      await load();
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Failed';
    }
  };

  const s = data?.stats;
  const statCards = s
    ? [
        { label: 'Seats taken', value: `${s.people} / ${s.capacity}` },
        { label: 'Tickets (groups)', value: s.tickets },
        { label: 'Checked in', value: `${s.checkedIn} / ${s.people}` },
        { label: 'Newsletter', value: s.newsletter },
      ]
    : [];

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div>
          <h2 className="font-semibold text-lg">Tickets · {ticketEvent.title.en}</h2>
          <p className="text-xs text-muted-foreground">
            slug <code>{ticketEvent.slug}</code> ·{' '}
            {ticketEvent.enabled ? <span className="text-primary">sign-ups open</span> : <span>hidden (enabled: false in src/config/ticketEvent.ts)</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" asChild><Link to="/admin/check-in"><ScanLine className="h-4 w-4 mr-1" /> Check-in</Link></Button>
          <Button size="sm" variant="outline" onClick={() => setAdding(true)}><Plus className="h-4 w-4 mr-1" /> Add guest</Button>
          <Button size="sm" variant="outline" onClick={() => data && downloadCsv(data.tickets, data.slug)} disabled={!data?.tickets.length}><Download className="h-4 w-4 mr-1" /> CSV</Button>
          <Button size="icon" variant="ghost" onClick={load} disabled={loading} aria-label="Refresh"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button>
          <Button size="icon" variant="ghost" onClick={logout} aria-label="Sign out of tickets"><LogOut className="h-4 w-4" /></Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      {s && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {statCards.map((c) => (
            <Card key={c.label} className="border shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="text-2xl font-bold tabular-nums">{c.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="relative mb-3">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search name, phone, email or code" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="space-y-2">
        {filtered.map((t) => (
          <Card key={t.id} className="border shadow-sm">
            <CardContent className="p-3 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{holderLine(t)}</p>
                  <code className="text-xs text-muted-foreground">{t.code}</code>
                  {t.source === 'manual' && <Badge variant="secondary">manual</Badge>}
                  {t.newsletter_consent && <Badge variant="outline">newsletter</Badge>}
                  {t.checked_in_at && <Badge>in {timeOf(t.checked_in_at)}{t.checked_in_by ? ` · ${t.checked_in_by}` : ''}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground truncate">{[t.email, t.phone].filter(Boolean).join(' · ') || '—'}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {t.checked_in_at ? (
                  <Button size="sm" variant="outline" disabled={busyId === t.id} onClick={() => act(t, 'undo')}><Undo2 className="h-4 w-4 mr-1" /> Undo</Button>
                ) : (
                  <Button size="sm" disabled={busyId === t.id} onClick={() => act(t, 'checkin')}><UserCheck className="h-4 w-4 mr-1" /> Check in</Button>
                )}
                <Button size="icon" variant="ghost" disabled={busyId === t.id || !t.email} onClick={() => act(t, 'resend')} aria-label="Resend email"><Mail className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" disabled={busyId === t.id} onClick={() => act(t, 'delete')} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {data && filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">{query ? 'No matches.' : 'No tickets yet.'}</p>}
      </div>

      <AddGuestDialog open={adding} onOpenChange={setAdding} onAdd={add} />
    </>
  );
}
