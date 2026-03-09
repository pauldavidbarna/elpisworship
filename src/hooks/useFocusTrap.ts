import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function useFocusTrap(onEscape?: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Move focus inside modal on open
    const focusables = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS));
    focusables[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      ).filter((el) => !el.closest('[inert]'));

      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onEscape]);

  return ref;
}
