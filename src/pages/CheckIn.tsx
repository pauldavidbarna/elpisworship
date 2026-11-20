import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, CheckCircle2, CircleAlert, Keyboard, LogOut, ScanLine, Search, Undo2, XCircle } from 'lucide-react';
import type { IScannerControls } from '@zxing/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ticketEvent } from '@/config/ticketEvent';
import { holderLine, matchesQuery, timeOf, useTicketsAdmin, type AdminStats, type AdminTicket } from '@/lib/ticketsAdmin';
import TicketsLogin from '@/components/tickets/TicketsLogin';
import { cn } from '@/lib/utils';

type ScanResult =
  | { result: 'ok'; ticket: AdminTicket; confirmed?: boolean }
  | { result: 'used'; ticket: AdminTicket }
  | { result: 'invalid' };

// Door-side check-in, built for a phone held in one hand: big targets, full-screen
// verdicts, and the camera paused while a verdict is on screen so it can't double-scan.
function Scanner({ onScan, paused }: { onScan: (text: string) => void; paused: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;
  const [cameraError, setCameraError] = useState('');

  useEffect(() => {
    if (paused) return;
    let controls: IScannerControls | undefined;
    let stopped = false;
    (async () => {
      try {
        const { BrowserQRCodeReader } = await import('@zxing/browser');
        const reader = new BrowserQRCodeReader(undefined, { delayBetweenScanAttempts: 150 });
        const c = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' } }, audio: false },
          videoRef.current!,
          (result) => {
            if (result && !stopped) {
              stopped = true;
              onScanRef.current(result.getText());
            }
          },
        );
        if (stopped) c.stop();
        else controls = c;
        setCameraError('');
      } catch (err) {
        setCameraError(err instanceof Error && err.name === 'NotAllowedError'
          ? 'Camera access was blocked. Allow it in the browser settings, or use manual search.'
          : 'Could not start the camera. Use manual search below.');
      }
    })();
    return () => {
      stopped = true;
      controls?.stop();
    };
  }, [paused]);

  return (
    <div className="relative aspect-square w-full max-w-md mx-auto rounded-2xl overflow-hidden bg-black">
      <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
      <div className="absolute inset-[15%] border-4 border-white/70 rounded-2xl pointer-events-none" />
      {cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white bg-black/80">
          <Camera className="h-10 w-10" />
          <p>{cameraError}</p>
        </div>
      )}
    </div>
  );
}

function Verdict({ scan, busy, onConfirm, onUndo, onClose }: {
  scan: ScanResult;
  busy: boolean;
  onConfirm: () => void;
  onUndo: () => void;
  onClose: () => void;
}) {
  const tone = scan.result === 'ok' ? 'bg-green-600' : scan.result === 'used' ? 'bg-amber-400 text-black' : 'bg-red-600';
  const Icon = scan.result === 'ok' ? CheckCircle2 : scan.result === 'used' ? CircleAlert : XCircle;

  return (
    <div className={cn('fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center text-white', tone)} role="alertdialog" aria-live="assertive">
      <Icon className="h-24 w-24 mb-6" strokeWidth={2.5} />
      {scan.result === 'invalid' ? (
        <>
          <p className="text-4xl font-bold mb-2">Invalid ticket</p>
          <p className="text-lg opacity-90">Forged, mistyped, deleted, or for another event.</p>
        </>
      ) : (
        <>
          <p className="text-3xl md:text-4xl font-bold mb-2 break-words max-w-full">
            {scan.result === 'ok' && scan.confirmed ? '✓ ' : ''}{holderLine(scan.ticket)}
          </p>
          <p className="text-xl font-semibold opacity-90">{scan.ticket.guests === 2 ? '2 people' : '1 person'} · {scan.ticket.code}</p>
          {scan.result === 'used' && scan.ticket.checked_in_at && (
            <p className="text-2xl font-bold mt-4">
              Already in at {timeOf(scan.ticket.checked_in_at)}{scan.ticket.checked_in_by ? ` (${scan.ticket.checked_in_by})` : ''}
            </p>
          )}
          {scan.result === 'ok' && scan.confirmed && <p className="text-2xl font-bold mt-4">Entry recorded</p>}
        </>
      )}

      <div className="w-full max-w-sm mt-10 space-y-3">
        {scan.result === 'ok' && !scan.confirmed && (
          <Button onClick={onConfirm} disabled={busy} className="w-full h-16 text-xl font-bold bg-white text-green-700 hover:bg-white/90">
            Confirm entry
          </Button>
        )}
        {((scan.result === 'ok' && scan.confirmed) || scan.result === 'used') && (
          <Button onClick={onUndo} disabled={busy} variant="ghost" className="w-full h-12 text-base text-current hover:bg-white/15 hover:text-current">
            <Undo2 className="h-5 w-5 mr-2" /> Undo
          </Button>
        )}
        <Button
          onClick={onClose}
          className={cn('w-full h-16 text-xl font-bold', scan.result === 'used' ? 'bg-black text-white hover:bg-black/85' : 'bg-black/25 text-white hover:bg-black/35')}
        >
          <ScanLine className="h-6 w-6 mr-2" /> Scan next
        </Button>
      </div>
    </div>
  );
}

const CheckIn = () => {
  const { token, login, logout, call } = useTicketsAdmin();
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<'scan' | 'manual'>('scan');
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Check-in | Elpis Worship';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await call<{ tickets: AdminTicket[]; stats: AdminStats }>('list');
      setTickets(res.tickets);
      setStats(res.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    }
  }, [call]);

  useEffect(() => {
    if (token) refresh();
  }, [token, refresh]);

  const handleScan = useCallback(async (text: string) => {
    if (navigator.vibrate) navigator.vibrate(60);
    setBusy(true);
    try {
      setScan(await call<ScanResult>('scan', { input: text }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed');
    } finally {
      setBusy(false);
    }
  }, [call]);

  const confirm = async (ticket: AdminTicket) => {
    setBusy(true);
    try {
      const res = await call<ScanResult>('checkin', { id: ticket.id });
      setScan(res.result === 'ok' ? { ...res, confirmed: true } : res);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check-in failed');
    } finally {
      setBusy(false);
    }
  };

  const undo = async (ticket: AdminTicket) => {
    setBusy(true);
    try {
      await call('undo', { id: ticket.id });
      setScan({ result: 'ok', ticket: { ...ticket, checked_in_at: null, checked_in_by: null } });
      refresh();
    } finally {
      setBusy(false);
    }
  };

  const matches = useMemo(() => (query.trim().length >= 2 ? tickets.filter((t) => matchesQuery(t, query)).slice(0, 30) : []), [tickets, query]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <TicketsLogin onLogin={login} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3 flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="icon" aria-label="Back to admin"><Link to="/admin"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <div className="text-center min-w-0">
          <p className="font-semibold truncate">{ticketEvent.title.en}</p>
          {stats && <p className="text-sm text-muted-foreground tabular-nums">{stats.checkedIn} / {stats.people} in</p>}
        </div>
        <Button variant="ghost" size="icon" onClick={logout} aria-label="Sign out"><LogOut className="h-5 w-5" /></Button>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button variant={mode === 'scan' ? 'default' : 'outline'} className="h-14 text-base" onClick={() => setMode('scan')}><ScanLine className="h-5 w-5 mr-2" /> Scan</Button>
          <Button variant={mode === 'manual' ? 'default' : 'outline'} className="h-14 text-base" onClick={() => setMode('manual')}><Keyboard className="h-5 w-5 mr-2" /> Search</Button>
        </div>

        {error && <p className="text-sm text-destructive text-center">{error}</p>}

        {mode === 'scan' ? (
          <>
            <Scanner onScan={handleScan} paused={!!scan || busy} />
            <p className="text-center text-muted-foreground">Point the camera at the ticket's QR code.</p>
          </>
        ) : (
          <>
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input autoFocus className="pl-10 h-14 text-lg" placeholder="Name, phone or code" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="space-y-2">
              {matches.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setScan(t.checked_in_at ? { result: 'used', ticket: t } : { result: 'ok', ticket: t })}
                  className="w-full text-left rounded-xl border p-4 active:bg-muted transition-colors"
                >
                  <p className="text-lg font-semibold">{holderLine(t)}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.code}{t.phone ? ` · ${t.phone}` : ''}
                    {t.checked_in_at && <span className="text-amber-600 font-medium"> · in at {timeOf(t.checked_in_at)}</span>}
                  </p>
                </button>
              ))}
              {query.trim().length >= 2 && matches.length === 0 && <p className="text-center text-muted-foreground py-6">No matches.</p>}
            </div>
          </>
        )}
      </main>

      {scan && (
        <Verdict
          scan={scan}
          busy={busy}
          onConfirm={() => scan.result === 'ok' && confirm(scan.ticket)}
          onUndo={() => scan.result !== 'invalid' && undo(scan.ticket)}
          onClose={() => { setScan(null); setQuery(''); }}
        />
      )}
    </div>
  );
};

export default CheckIn;
