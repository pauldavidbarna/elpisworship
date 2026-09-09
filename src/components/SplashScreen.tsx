import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/logo.svg';

// ready=false keeps the splash up past the minimum duration so the app's real
// data (from Supabase) is in place before the page underneath is revealed —
// otherwise a stale localStorage snapshot flashes first on slow connections.
const SplashScreen = ({ onDone, ready }: { onDone: () => void; ready: boolean }) => {
  const [visible, setVisible] = useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 1400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (minTimeElapsed && ready) setVisible(false);
  }, [minTimeElapsed, ready]);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
        >
          <motion.img
            src={logo}
            alt="Elpis Worship"
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-32 md:h-44 w-auto"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
