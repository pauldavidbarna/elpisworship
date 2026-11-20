import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";
import { ticketEvent, SITE_URL } from "./src/config/ticketEvent";

// Link previews (WhatsApp, Facebook) don't run JavaScript, so /tickets gets its own copy
// of index.html with the event's title and poster baked into the Open Graph tags.
// vercel.json rewrites /tickets to this file.
function ticketsOgPage(): Plugin {
  return {
    name: "tickets-og-page",
    apply: "build",
    closeBundle() {
      const out = path.resolve(__dirname, "dist");
      const indexPath = path.join(out, "index.html");
      if (!fs.existsSync(indexPath)) return;
      const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
      const title = esc(`${ticketEvent.title.gr} | Elpis Worship`);
      const description = esc(ticketEvent.subtitle.gr);
      const url = `${SITE_URL}/tickets`;
      const image = ticketEvent.enabled && ticketEvent.posterPath ? `${SITE_URL}${ticketEvent.posterPath}` : `${SITE_URL}/og-image.jpg`;
      const html = fs
        .readFileSync(indexPath, "utf8")
        .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
        .replace(/(<meta (?:name|property)="(?:og:title|twitter:title)" content=")[^"]*"/g, `$1${title}"`)
        .replace(/(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*"/g, `$1${description}"`)
        .replace(/(<meta (?:name|property)="(?:og:image|twitter:image)" content=")[^"]*"/g, `$1${image}"`)
        .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${url}"`)
        .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${url}"`);
      fs.writeFileSync(path.join(out, "tickets.html"), html);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), ticketsOgPage(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
