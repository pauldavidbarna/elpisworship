import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const SPOTIFY_ARTIST_URL = 'https://open.spotify.com/artist/6Vpsb6n5cBmH3midkqMeE0';
const CONSENT_KEY = 'elpis_cookie_consent';
const SHOW_DELAY_MS = 2500;

const SpotifyPopup = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [hasConsentChoice, setHasConsentChoice] = useState(() => !!localStorage.getItem(CONSENT_KEY));
  const [visible, setVisible] = useState(false);
  // Same as CookieBanner: step aside while a Radix dialog is open.
  const [dialogOpen, setDialogOpen] = useState(false);

  // Wait for the cookie banner to be answered so the two don't stack at the bottom.
  useEffect(() => {
    const onConsent = () => setHasConsentChoice(true);
    window.addEventListener('elpis-consent', onConsent);
    return () => window.removeEventListener('elpis-consent', onConsent);
  }, []);

  useEffect(() => {
    if (!hasConsentChoice) return;
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

  if (pathname.startsWith('/admin')) return null;

  return (
    <AnimatePresence>
      {visible && !dialogOpen && (
        <motion.a
          href={SPOTIFY_ARTIST_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('spotify.open_in_app')}
          title={t('spotify.open_in_app')}
          initial={{ x: 120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 120, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-4 right-4 z-[80] flex h-10 w-10 items-center justify-center rounded-full bg-black shadow-xl hover:scale-105 transition-transform"
        >
          <svg viewBox="0 0 24 24" className="h-10 w-10" fill="#1DB954" aria-hidden="true">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
        </motion.a>
      )}
    </AnimatePresence>
  );
};

export default SpotifyPopup;
