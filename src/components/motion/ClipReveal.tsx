import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EASE_OUT } from '@/lib/motion';

interface ClipRevealProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  delay?: number;
}

// Content opens out of a slightly smaller rounded window while easing in from a touch
// of zoom (a calm take on two26.studio's project cards). The window ends a little
// larger than the element so card shadows aren't cut off.
const ClipReveal = ({ children, className, innerClassName, delay = 0 }: ClipRevealProps) => {
  const transition = { duration: 0.9, delay, ease: EASE_OUT };
  const viewport = { once: true, margin: '0px 0px -10% 0px' };
  return (
    <motion.div
      className={className}
      initial={{ clipPath: 'inset(8% 8% 8% 8% round 16px)', opacity: 0 }}
      whileInView={{ clipPath: 'inset(-10% -10% -10% -10% round 0px)', opacity: 1 }}
      viewport={viewport}
      transition={transition}
    >
      <motion.div
        className={cn('h-full', innerClassName)}
        initial={{ scale: 1.06 }}
        whileInView={{ scale: 1 }}
        viewport={viewport}
        transition={transition}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default ClipReveal;
