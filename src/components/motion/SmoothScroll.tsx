import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

const LenisContext = createContext<Lenis | null>(null);

export const useLenis = () => useContext(LenisContext);

// Inertia scrolling (as on two26.studio). Skipped for reduced-motion users and on
// /admin, whose long forms and dialogs are easier to work with on native scroll.
const SmoothScroll = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const disabled = pathname.startsWith('/admin');

  useEffect(() => {
    if (disabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const instance = new Lenis({
      lerp: 0.1,
      autoRaf: true,
      // Let nested scrollers (dialogs, dropdowns, scroll areas) scroll natively, and
      // stay out of the way while a Radix modal has locked the page.
      prevent: (node) =>
        document.body.hasAttribute('data-scroll-locked') ||
        !!node.closest('[data-lenis-prevent], [role="dialog"], [role="listbox"], [role="menu"], [data-radix-scroll-area-viewport]'),
    });
    setLenis(instance);
    return () => {
      instance.destroy();
      setLenis(null);
    };
  }, [disabled]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
};

export default SmoothScroll;
