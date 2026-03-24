import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
const CONSENT_KEY = 'elpis_cookie_consent';

export function useCookieConsent() {
  return localStorage.getItem(CONSENT_KEY);
}

const CookieBanner = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-[90] bg-background border-t border-border shadow-2xl"
        >
          <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Cookie className="h-5 w-5 text-primary shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-sm text-muted-foreground flex-1">
              {t('cookie.message')}{' '}
              <Link to="/privacy" className="underline hover:text-foreground transition-colors">
                {t('cookie.privacy')}
              </Link>
              .
            </p>
            <div className="flex gap-2 shrink-0 w-full sm:w-auto">
              <Button size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={decline}>
                {t('cookie.decline')}
              </Button>
              <Button size="sm" className="flex-1 sm:flex-none" onClick={accept}>
                {t('cookie.accept')}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
