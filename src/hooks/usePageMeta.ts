import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BASE_URL = 'https://elpisworship.com';

function setLink(rel: string, hreflang: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(
    `link[rel="${rel}"][hreflang="${hreflang}"]`
  );
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    el.setAttribute('hreflang', hreflang);
    document.head.appendChild(el);
  }
  el.href = href;
}

function setCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

export function usePageMeta(title: string, description: string) {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = `${title} | Elpis Worship`;
    const canonical = `${BASE_URL}${pathname}`;
    const enUrl = `${BASE_URL}${pathname}?lang=en`;

    document.title = fullTitle;

    const set = (sel: string, val: string) =>
      document.querySelector(sel)?.setAttribute('content', val);

    set('meta[name="description"]', description);
    set('meta[property="og:title"]', fullTitle);
    set('meta[property="og:description"]', description);
    set('meta[property="og:url"]', canonical);
    set('meta[name="twitter:title"]', fullTitle);
    set('meta[name="twitter:description"]', description);

    setCanonical(canonical);
    setLink('alternate', 'el', canonical);
    setLink('alternate', 'en', enUrl);
    setLink('alternate', 'x-default', canonical);
  }, [title, description, pathname]);
}
