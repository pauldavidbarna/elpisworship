import { useEffect } from 'react';

export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const fullTitle = `${title} | Elpis Worship`;
    const url = window.location.href;

    document.title = fullTitle;

    const set = (sel: string, val: string) =>
      document.querySelector(sel)?.setAttribute('content', val);

    set('meta[name="description"]', description);
    set('meta[property="og:title"]', fullTitle);
    set('meta[property="og:description"]', description);
    set('meta[property="og:url"]', url);
    set('meta[name="twitter:title"]', fullTitle);
    set('meta[name="twitter:description"]', description);
  }, [title, description]);
}
