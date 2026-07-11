import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/logo.svg';

const SplashScreen = ({ onDone }: { onDone: () => void }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1400);
    return () => clearTimeout(timer);
  }, []);

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
