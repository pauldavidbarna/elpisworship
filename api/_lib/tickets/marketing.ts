import type { TicketRow } from './db.js';

// SendX (https://docs.sendx.io). Everything is optional: with no API key this is a no-op,
// and any failure is logged and swallowed so it can never block a ticket.
//   SENDX_API_KEY            team API key
//   SENDX_EVENT_LIST_ID      list_… every ticket holder joins
//   SENDX_EVENT_TAG_ID       tag_…  every ticket holder gets
//   SENDX_NEWSLETTER_LIST_ID list_… only holders who opted in join
const BASE = 'https://api.sendx.io/api/v1/rest';

interface SendxContact {
  id: string;
  email: string;
  lists?: string[];
  tags?: string[];
}

async function sendx(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', 'X-Team-ApiKey': process.env.SENDX_API_KEY!, ...init.headers },
  });
}

async function findContact(email: string): Promise<SendxContact | null> {
  const res = await sendx(`/contact?search=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error(`search ${res.status}`);
  const body = (await res.json()) as SendxContact[] | { data?: SendxContact[]; contacts?: SendxContact[] };
  const items = Array.isArray(body) ? body : (body.data ?? body.contacts ?? []);
  // search is a partial match across name and email, so pick the exact email.
  return items.find((c) => c.email?.toLowerCase() === email) ?? null;
}

export async function syncTicketHolder(ticket: TicketRow): Promise<void> {
  if (!process.env.SENDX_API_KEY || !ticket.email) return;
  const lists = [process.env.SENDX_EVENT_LIST_ID, ticket.newsletter_consent ? process.env.SENDX_NEWSLETTER_LIST_ID : undefined].filter(
    (v): v is string => !!v,
  );
  const tags = [process.env.SENDX_EVENT_TAG_ID].filter((v): v is string => !!v);
  const [firstName, ...rest] = ticket.name.split(' ');

  try {
    const created = await sendx('/contact', {
      method: 'POST',
      body: JSON.stringify({ email: ticket.email, firstName, lastName: rest.join(' '), lists, tags }),
    });
    if (created.ok) return;
    if (created.status !== 409) throw new Error(`create ${created.status}: ${await created.text()}`);

    // Already a contact. lists/tags are replaced on update, so send the union with
    // what they already have; other fields are left out so they stay untouched.
    const existing = await findContact(ticket.email);
    if (!existing) throw new Error('409 but contact not found by search');
    const union = (a: string[] = [], b: string[]) => [...new Set([...a, ...b])];
    const updated = await sendx(`/contact/${encodeURIComponent(existing.id)}`, {
      method: 'PUT',
      body: JSON.stringify({ lists: union(existing.lists, lists), tags: union(existing.tags, tags) }),
    });
    if (!updated.ok) throw new Error(`update ${updated.status}: ${await updated.text()}`);
  } catch (err) {
    console.error('SendX sync failed for ticket', ticket.code, err instanceof Error ? err.message : err);
  }
}
