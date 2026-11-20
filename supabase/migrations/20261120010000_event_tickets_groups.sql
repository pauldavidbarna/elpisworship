-- Tickets can now admit a group of up to 10 people, and capacity counts people
-- (seats), not tickets. Raises 'duplicate', 'full' (no seats left) or
-- 'not_enough:<remaining>' (some seats left, but fewer than the group needs).

alter table public.event_tickets drop constraint if exists event_tickets_guests_check;
alter table public.event_tickets add constraint event_tickets_guests_check check (guests between 1 and 10);

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
  v_row       public.event_tickets;
  v_remaining int;
begin
  perform pg_advisory_xact_lock(hashtext('claim_ticket:' || p_event_slug));

  if p_email is not null and exists (
    select 1 from public.event_tickets
    where event_slug = p_event_slug and lower(email) = lower(p_email)
  ) then
    raise exception 'duplicate';
  end if;

  select p_capacity - coalesce(sum(guests), 0) into v_remaining
  from public.event_tickets where event_slug = p_event_slug;

  if v_remaining <= 0 then
    raise exception 'full';
  end if;
  if p_guests > v_remaining then
    raise exception 'not_enough:%', v_remaining;
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
