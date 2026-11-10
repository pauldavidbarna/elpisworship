import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EASE_OUT } from '@/lib/motion';

interface PopInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** "mount" plays immediately (hero), "view" waits until scrolled into view. */
  trigger?: 'mount' | 'view';
}

// Soft fade-and-grow for icons and buttons.
const PopIn = ({ children, className, delay = 0, trigger = 'view' }: PopInProps) => {
  const target = { opacity: 1, scale: 1 };
  return (
    <motion.div
      className={cn('inline-flex', className)}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={trigger === 'mount' ? target : undefined}
      whileInView={trigger === 'view' ? target : undefined}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.6, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
};

export default PopIn;
