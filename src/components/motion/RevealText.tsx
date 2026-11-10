import { ElementType, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { EASE_OUT } from '@/lib/motion';

interface RevealTextProps {
  text: string;
  as?: ElementType;
  /** "mount" plays immediately (hero), "view" waits until scrolled into view. */
  trigger?: 'mount' | 'view';
  /** Slide each word up from behind a mask (headings). Off = a plain soft fade (body text). */
  split?: boolean;
  delay?: number;
  className?: string;
}

const STAGGER = 0.05;
const DURATION = 0.7;

// Headings: each word slides up from behind its own overflow mask (two26.studio's
// line reveal, toned down). Body text just fades up a few pixels.
const RevealText = ({ as: Tag = 'span', text, trigger = 'view', split = true, delay = 0, className }: RevealTextProps) => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const play = trigger === 'mount' || inView;

  if (!split) {
    return (
      <Tag ref={ref} className={className}>
        <motion.span
          className="block"
          initial={{ opacity: 0, y: 8 }}
          animate={play ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: DURATION, delay, ease: EASE_OUT }}
        >
          {text}
        </motion.span>
      </Tag>
    );
  }

  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      <span aria-hidden>
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]">
            <motion.span
              className="inline-block"
              initial={{ y: '100%' }}
              animate={play ? { y: '0%' } : undefined}
              transition={{ duration: DURATION, delay: delay + i * STAGGER, ease: EASE_OUT }}
            >
              {word}
            </motion.span>
            {i < words.length - 1 && ' '}
          </span>
        ))}
      </span>
    </Tag>
  );
};

export default RevealText;
