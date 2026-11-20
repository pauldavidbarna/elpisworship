-- Tickets for physical events, with QR check-in at the door.
-- Only the Vercel functions touch this table, through the service role key:
-- RLS is on with no policies, so the anon key used by the browser sees nothing.

create table if not exists public.event_tickets (
  id                     uuid primary key default gen_random_uuid(),
  event_slug             text not null,
  code                   text not null unique,
  name                   text not null,
  email                  text,                      -- stored lowercase; null only for manual guests
  phone                  text,
  guests                 smallint not null default 1 check (guests in (1, 2)),
  guest_name             text,
  newsletter_consent     boolean not null default false,
  lang                   text not null default 'gr' check (lang in ('en', 'gr')),
  source                 text not null default 'public' check (source in ('public', 'manual')),
  checked_in_at          timestamptz,
  checked_in_by          text,
  reminder_email_sent_at timestamptz,
  reminder_sms_sent_at   timestamptz,
  created_at             timestamptz not null default now()
);

create unique index if not exists event_tickets_slug_email_key
  on public.event_tickets (event_slug, lower(email));
create index if not exists event_tickets_slug_idx
  on public.event_tickets (event_slug, created_at);

alter table public.event_tickets enable row level security;

-- Claims a ticket atomically. The advisory lock serialises claims per event, so the
-- duplicate check and the capacity check can't race with a concurrent sign-up.
-- Raises 'duplicate' or 'full' (SQLSTATE P0001) for the caller to map to a response.
create or replace function public.claim_ticket(
  p_event_slug text,
  p_capacity   int,
  p_code       text,
  p_name       text,
  p_email      text,
  p_phone      text,
  p_guests     int,
  p_guest_name text,
  p_newsletter boolean,
  p_lang       text,
  p_source     text
)
returns public.event_tickets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row   public.event_tickets;
  v_count int;
begin
  perform pg_advisory_xact_lock(hashtext('claim_ticket:' || p_event_slug));

  if p_email is not null and exists (
    select 1 from public.event_tickets
    where event_slug = p_event_slug and lower(email) = lower(p_email)
  ) then
    raise exception 'duplicate';
  end if;

  select count(*) into v_count from public.event_tickets where event_slug = p_event_slug;
  if v_count >= p_capacity then
    raise exception 'full';
  end if;

  insert into public.event_tickets
    (event_slug, code, name, email, phone, guests, guest_name, newsletter_consent, lang, source)
  values
    (p_event_slug, p_code, p_name, lower(p_email), p_phone, p_guests, p_guest_name, p_newsletter, p_lang, p_source)
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.claim_ticket(text, int, text, text, text, text, int, text, boolean, text, text) from public, anon, authenticated;
grant execute on function public.claim_ticket(text, int, text, text, text, text, int, text, boolean, text, text) to service_role;
