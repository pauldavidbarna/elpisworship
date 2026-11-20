import { useCallback, useState } from 'react';

// Tickets have their own admin session, signed by the server, because the main admin
// password lives in the browser bundle. The token is kept for the session's 16 h so a
// door phone doesn't have to sign in again mid-event.
const TOKEN_KEY = 'elpis_tickets_admin';

export interface AdminTicket {
  id: string;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  guests: number;
  guest_name: string | null;
  newsletter_consent: boolean;
  lang: 'en' | 'gr';
  source: 'public' | 'manual';
  checked_in_at: string | null;
  checked_in_by: string | null;
  created_at: string;
}

export interface AdminStats {
  tickets: number;
  people: number;
  checkedIn: number;
  newsletter: number;
  capacity: number;
}

export class UnauthorizedError extends Error {}

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function useTicketsAdmin() {
  const [token, setToken] = useState<string | null>(readToken);

  const login = useCallback(async (name: string, password: string) => {
    const res = await fetch('/api/tickets-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', name, password }),
    });
    if (!res.ok) throw new Error(res.status === 429 ? 'Too many attempts, wait a few minutes.' : 'Wrong password');
    const { token: t } = (await res.json()) as { token: string };
    try { localStorage.setItem(TOKEN_KEY, t); } catch { /* still works for this page view */ }
    setToken(t);
  }, []);

  const logout = useCallback(() => {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
    setToken(null);
  }, []);

  const call = useCallback(
    async <T,>(action: string, payload: Record<string, unknown> = {}): Promise<T> => {
      const res = await fetch('/api/tickets-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, ...payload }),
      });
      if (res.status === 401) {
        logout();
        throw new UnauthorizedError('Session expired');
      }
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      return res.json() as Promise<T>;
    },
    [token, logout],
  );

  return { token, login, logout, call };
}

export const holderLine = (t: Pick<AdminTicket, 'name' | 'guests' | 'guest_name'>) =>
  t.guests > 1 ? `${t.name} + ${t.guests - 1}${t.guest_name ? ` (${t.guest_name})` : ''}` : t.name;

export const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit', hour12: false });

/** Matches name, phone (ignoring spaces / +30), email or code. */
export function matchesQuery(t: AdminTicket, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const digits = q.replace(/\D/g, '');
  return (
    t.name.toLowerCase().includes(q) ||
    (t.guest_name ?? '').toLowerCase().includes(q) ||
    (t.email ?? '').includes(q) ||
    t.code.toLowerCase().includes(q) ||
    (digits.length >= 4 && (t.phone ?? '').replace(/\D/g, '').includes(digits))
  );
}

export function downloadCsv(tickets: AdminTicket[], slug: string) {
  const header = ['Code', 'Name', 'Guests', 'Guest name', 'Email', 'Phone', 'Newsletter', 'Language', 'Source', 'Created', 'Checked in', 'Checked in by'];
  const cell = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = tickets.map((t) => [
    t.code, t.name, t.guests, t.guest_name, t.email, t.phone, t.newsletter_consent ? 'yes' : 'no', t.lang, t.source,
    new Date(t.created_at).toLocaleString('el-GR'), t.checked_in_at ? new Date(t.checked_in_at).toLocaleString('el-GR') : '', t.checked_in_by,
  ]);
  // The BOM makes Excel read the file as UTF-8, so Greek and diacritics display correctly.
  const csv = '﻿' + [header, ...rows].map((r) => r.map(cell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slug}-tickets.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
