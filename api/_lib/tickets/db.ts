import { createClient } from '@supabase/supabase-js';

export interface TicketRow {
  id: string;
  event_slug: string;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  guests: 1 | 2;
  guest_name: string | null;
  newsletter_consent: boolean;
  lang: 'en' | 'gr';
  source: 'public' | 'manual';
  checked_in_at: string | null;
  checked_in_by: string | null;
  reminder_email_sent_at: string | null;
  reminder_sms_sent_at: string | null;
  created_at: string;
}

let client: ReturnType<typeof createClient> | null = null;

// Service-role client: bypasses RLS, so it must never reach the browser bundle.
// fetch is pinned to no-store so a cached response can't freeze the seat counter.
export function db() {
  if (client) return client;
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set');
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) },
  });
  return client;
}

export async function countTickets(slug: string): Promise<{ tickets: number; people: number; checkedIn: number; newsletter: number }> {
  const { data, error } = await db()
    .from('event_tickets')
    .select('guests, checked_in_at, newsletter_consent')
    .eq('event_slug', slug);
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Pick<TicketRow, 'guests' | 'checked_in_at' | 'newsletter_consent'>[];
  return {
    tickets: rows.length,
    people: rows.reduce((sum, r) => sum + r.guests, 0),
    checkedIn: rows.reduce((sum, r) => sum + (r.checked_in_at ? r.guests : 0), 0),
    newsletter: rows.filter((r) => r.newsletter_consent).length,
  };
}

export async function findTicketByCode(code: string): Promise<TicketRow | null> {
  const { data, error } = await db().from('event_tickets').select('*').eq('code', code).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as TicketRow | null) ?? null;
}

export type ClaimInput = {
  slug: string;
  capacity: number;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  guests: 1 | 2;
  guestName: string | null;
  newsletter: boolean;
  lang: 'en' | 'gr';
  source: 'public' | 'manual';
};

export type ClaimResult = { ok: true; ticket: TicketRow } | { ok: false; reason: 'duplicate' | 'full' };

export async function claimTicket(input: ClaimInput): Promise<ClaimResult> {
  const { data, error } = await db().rpc('claim_ticket', {
    p_event_slug: input.slug,
    p_capacity: input.capacity,
    p_code: input.code,
    p_name: input.name,
    p_email: input.email,
    p_phone: input.phone,
    p_guests: input.guests,
    p_guest_name: input.guestName,
    p_newsletter: input.newsletter,
    p_lang: input.lang,
    p_source: input.source,
  } as never);
  if (error) {
    if (error.message === 'duplicate' || error.message === 'full') return { ok: false, reason: error.message };
    // The unique index is the backstop if two claims slip past the function's check.
    if (error.code === '23505' && /email/.test(error.message)) return { ok: false, reason: 'duplicate' };
    throw new Error(error.message);
  }
  return { ok: true, ticket: data as unknown as TicketRow };
}

/** Claims with a fresh code, retrying on the (astronomically rare) code collision. */
export async function claimWithFreshCode(input: Omit<ClaimInput, 'code'>, generate: () => string): Promise<ClaimResult> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await claimTicket({ ...input, code: generate() });
    } catch (err) {
      if (attempt < 2 && err instanceof Error && /event_tickets_code_key/.test(err.message)) continue;
      throw err;
    }
  }
}
