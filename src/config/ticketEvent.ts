// Single source of truth for the ticketed event. The public page (/tickets), the
// ticket page, the confirmation email, the PDF, the reminders and the admin check-in
// all read from here, so filling in the next event means editing only this file.
//
// It's imported by both the browser bundle and the Vercel functions in /api, so it
// must stay plain data: no asset imports, no secrets (those live in env vars).

export type Lang = 'en' | 'gr';
export type Localized = Record<Lang, string>;

export interface TicketEventConfig {
  /** false hides /tickets ("coming soon") and makes the API refuse new sign-ups. */
  enabled: boolean;
  /** Stored on every ticket; change it for each new event so counts start from zero. */
  slug: string;
  title: Localized;
  subtitle: Localized;
  /** ISO 8601 with the venue's UTC offset, e.g. '2027-03-14T19:00:00+02:00'. */
  startsAt: string;
  endsAt: string;
  /** IANA zone used to print times in emails/PDF regardless of where the server runs. */
  timeZone: string;
  venue: {
    name: string;
    address: string;
    /** Short hint for finding the entrance, e.g. 'Next to the metro exit'. Optional. */
    landmark: Localized | null;
    mapsUrl: string;
  };
  /** Number of seats (people). A ticket admits a group of 1 to maxGroupSize people. */
  capacity: number;
  /** Largest group one ticket can admit, the holder included. */
  maxGroupSize: number;
  /** Below this many taken seats the page shows "Limited seats · N seats" instead of the live count. 0 always shows the count. */
  showCountAfter: number;
  /** Full poster, shown on the page and used as the Open Graph image. Path under /public. */
  posterPath: string;
  /** Poster artwork only (no text), used as the PDF ticket background. Path under /public. Empty = plain PDF. */
  artworkPath: string;
  /** Replies to the confirmation email go here. */
  replyTo: string;
}

export const ticketEvent: TicketEventConfig = {
  enabled: false, // TODO: set to true when the details below are final
  slug: 'worship-night-2027', // TODO
  title: {
    en: 'Worship Night', // TODO
    gr: 'Βραδιά Λατρείας', // TODO
  },
  subtitle: {
    en: 'An evening of worship with Elpis Worship', // TODO
    gr: 'Μια βραδιά λατρείας με τους Elpis Worship', // TODO
  },
  startsAt: '2027-03-14T19:00:00+02:00', // TODO
  endsAt: '2027-03-14T22:00:00+02:00', // TODO
  timeZone: 'Europe/Athens',
  venue: {
    name: 'TODO venue name',
    address: 'TODO street, number, city',
    landmark: null, // e.g. { en: 'Entrance from the side street', gr: 'Είσοδος από τον πλαϊνό δρόμο' }
    mapsUrl: 'https://maps.google.com/?q=Athens', // TODO
  },
  capacity: 100, // TODO: seats (people), not tickets
  maxGroupSize: 10,
  showCountAfter: 20,
  posterPath: '/events/worship-night/poster.jpg', // TODO: replace the logo placeholder in public/ with the real poster
  artworkPath: '/events/worship-night/artwork.jpg', // TODO: replace the placeholder with the poster image without its text
  replyTo: 'worshipelpis@gmail.com',
};

export const SITE_URL = 'https://elpisworship.com';
