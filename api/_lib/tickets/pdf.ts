import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, rgb, type PDFFont, type PDFImage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { ticketEvent } from '../../../src/config/ticketEvent.js';
import type { TicketRow } from './db.js';
import { qrPng } from './qr.js';
import { T, formatDate, holderLine, siteUrl, timeRange, ticketUrls } from './text.js';

// pdf-lib instead of headless Chromium: pure JS, so it runs in a plain Vercel function
// without a 50 MB browser binary or a cold start. Noto Sans covers Greek and Latin.
const FONT_DIR = path.join(process.cwd(), 'api/_lib/tickets/fonts');
let fonts: Promise<[Buffer, Buffer]> | null = null;
const loadFonts = () =>
  (fonts ??= Promise.all([readFile(path.join(FONT_DIR, 'NotoSans-Regular.ttf')), readFile(path.join(FONT_DIR, 'NotoSans-Bold.ttf'))]));

let artwork: Promise<{ bytes: Uint8Array; png: boolean } | null> | null = null;
function loadArtwork() {
  if (!ticketEvent.artworkPath) return Promise.resolve(null);
  return (artwork ??= fetch(`${siteUrl()}${ticketEvent.artworkPath}`)
    .then(async (res) => {
      if (!res.ok) return null;
      const type = res.headers.get('content-type') ?? '';
      return { bytes: new Uint8Array(await res.arrayBuffer()), png: type.includes('png') || ticketEvent.artworkPath.endsWith('.png') };
    })
    .catch(() => null));
}

// A5 portrait in points.
const W = 419.53;
const H = 595.28;
const M = 32;

// Greek capitals are written without accents (ΗΜΕΡΟΜΗΝΙΑ, not ΗΜΕΡΟΜΗΝΊΑ).
const caps = (s: string) => s.normalize('NFD').replace(/\u0301/g, '').toUpperCase().normalize('NFC');

function fitText(text: string, font: PDFFont, maxSize: number, maxWidth: number): number {
  let size = maxSize;
  while (size > 9 && font.widthOfTextAtSize(text, size) > maxWidth) size -= 0.5;
  return size;
}

function drawCover(page: ReturnType<PDFDocument['addPage']>, img: PDFImage, height: number) {
  const scale = Math.max(W / img.width, height / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  page.drawImage(img, { x: (W - w) / 2, y: H - height + (height - h) / 2, width: w, height: h });
}

export async function ticketPdf(ticket: TicketRow): Promise<Uint8Array> {
  const lang = ticket.lang;
  const t = T[lang];
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(`${ticketEvent.title[lang]} · ${ticket.code}`);
  doc.setAuthor('Elpis Worship');

  const [regBytes, boldBytes] = await loadFonts();
  const regular = await doc.embedFont(regBytes, { subset: true });
  const bold = await doc.embedFont(boldBytes, { subset: true });
  const page = doc.addPage([W, H]);

  const ink = rgb(0.07, 0.07, 0.09);
  const muted = rgb(0.42, 0.42, 0.46);
  const accent = rgb(0, 0.76, 0.8); // site turquoise #00c2cc

  // Artwork band across the top, with a dark fade so the title stays readable.
  const bandH = 200;
  const art = await loadArtwork();
  page.drawRectangle({ x: 0, y: H - bandH, width: W, height: bandH, color: rgb(0.08, 0.09, 0.12) });
  if (art) {
    try {
      const img = art.png ? await doc.embedPng(art.bytes) : await doc.embedJpg(art.bytes);
      drawCover(page, img, bandH);
    } catch {
      // Unsupported image format: keep the plain band.
    }
  }
  for (let i = 0; i < 24; i++) {
    page.drawRectangle({ x: 0, y: H - bandH + i * 3, width: W, height: 3, color: rgb(0, 0, 0), opacity: 0.55 * (1 - i / 24) });
  }
  const title = ticketEvent.title[lang];
  const titleSize = fitText(title, bold, 26, W - 2 * M);
  page.drawText(title, { x: M, y: H - bandH + 22, size: titleSize, font: bold, color: rgb(1, 1, 1) });

  // Holder
  let y = H - bandH - 44;
  const holder = holderLine(ticket);
  const holderSize = fitText(holder, bold, 24, W - 2 * M);
  page.drawText(holder, { x: M, y, size: holderSize, font: bold, color: ink });
  y -= 20;
  page.drawText(t.admits(ticket.guests), { x: M, y, size: 11, font: regular, color: accent });

  // Details
  y -= 30;
  const rows: [string, string][] = [
    [t.date, formatDate(ticketEvent.startsAt, lang)],
    [t.time, timeRange(lang)],
    [t.venue, `${ticketEvent.venue.name}, ${ticketEvent.venue.address}`],
  ];
  for (const [label, value] of rows) {
    page.drawText(caps(label), { x: M, y, size: 7.5, font: bold, color: muted });
    y -= 13;
    page.drawText(value, { x: M, y, size: fitText(value, regular, 11, W - 2 * M - 150), font: regular, color: ink });
    y -= 20;
  }
  if (ticketEvent.venue.landmark) {
    page.drawText(ticketEvent.venue.landmark[lang], { x: M, y: y + 6, size: 9, font: regular, color: muted, maxWidth: W - 2 * M - 150 });
  }

  // QR, bottom-right, with the code under it
  const { page: ticketPage } = ticketUrls(ticket.code);
  const qr = await doc.embedPng(await qrPng(ticketPage, 600));
  const qrSize = 132;
  const qrX = W - M - qrSize;
  const qrY = 78;
  page.drawImage(qr, { x: qrX, y: qrY, width: qrSize, height: qrSize });
  page.drawText(caps(t.code), { x: M, y: qrY + 10, size: 7.5, font: bold, color: muted });
  page.drawText(ticket.code, { x: M, y: qrY - 8, size: 18, font: bold, color: ink });

  // Footer
  page.drawLine({ start: { x: M, y: 46 }, end: { x: W - M, y: 46 }, thickness: 0.5, color: rgb(0.85, 0.85, 0.87) });
  page.drawText(t.free, { x: M, y: 28, size: 8.5, font: regular, color: muted });
  const brand = 'elpisworship.com';
  page.drawText(brand, { x: W - M - bold.widthOfTextAtSize(brand, 8.5), y: 28, size: 8.5, font: bold, color: accent });

  return doc.save();
}
