import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Minus, X, ExternalLink } from 'lucide-react';

// Spotify embed: https://open.spotify.com/embed/{album,playlist,artist}/<ID>
const SPOTIFY_EMBED_URL = 'https://open.spotify.com/embed/album/4nsIsjUtBM0Jjcnfcv62NQ?utm_source=generator&theme=0';
// The embed only plays 30s previews for visitors not logged in to Spotify, so offer the full album.
const SPOTIFY_OPEN_URL = 'https://open.spotify.com/album/4nsIsjUtBM0Jjcnfcv62NQ';
const DISMISSED_KEY = 'elpis_spotify_dismissed';
const CONSENT_KEY = 'elpis_cookie_consent';
const SHOW_DELAY_MS = 2500;

const SpotifyPopup = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [hasConsentChoice, setHasConsentChoice] = useState(() => !!localStorage.getItem(CONSENT_KEY));
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);
  // Same as CookieBanner: step aside while a Radix dialog is open (hidden, not
  // unmounted, so the music keeps playing).
  const [dialogOpen, setDialogOpen] = useState(false);

  // Wait for the cookie banner to be answered so the two don't stack at the bottom.
  useEffect(() => {
    const onConsent = () => setHasConsentChoice(true);
    window.addEventListener('elpis-consent', onConsent);
    return () => window.removeEventListener('elpis-consent', onConsent);
  }, []);

  useEffect(() => {
    if (!hasConsentChoice || sessionStorage.getItem(DISMISSED_KEY)) return;
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [hasConsentChoice]);

  useEffect(() => {
    const check = () => setDialogOpen(document.body.hasAttribute('data-scroll-locked'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-scroll-locked'] });
    return () => observer.disconnect();
  }, []);

  const close = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  if (pathname.startsWith('/admin')) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 120, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`fixed bottom-4 right-4 z-[80] flex flex-col items-end gap-2 ${dialogOpen ? 'hidden' : ''}`}
        >
          {/* The iframe stays mounted while minimized so playback isn't interrupted. */}
          <div
            className={`w-[min(352px,calc(100vw-2rem))] rounded-2xl border border-border bg-background shadow-2xl overflow-hidden ${minimized ? 'hidden' : ''}`}
          >
            <div className="flex items-center justify-between gap-2 px-3 py-2">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Music className="h-4 w-4 text-[#1DB954]" />
                {t('spotify.title')}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMinimized(true)}
                  aria-label={t('spotify.minimize')}
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={close}
                  aria-label={t('spotify.close')}
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <iframe
              title="Spotify"
              src={SPOTIFY_EMBED_URL}
              width="100%"
              height="352"
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              className="block border-0"
            />
            <a
              href={SPOTIFY_OPEN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#1DB954] px-3 py-2.5 text-sm font-semibold text-black hover:bg-[#1ed760] transition-colors"
            >
              {t('spotify.open_in_app')}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          {minimized && (
            <button
              type="button"
              onClick={() => setMinimized(false)}
              aria-label={t('spotify.open')}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1DB954] text-white shadow-xl hover:scale-105 transition-transform"
            >
              <Music className="h-5 w-5" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SpotifyPopup;
