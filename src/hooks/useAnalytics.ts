const GA_ID = 'G-2N08FBH73Z';
const CLARITY_ID = 'vra45vkduo';

function loadGA() {
  if (document.getElementById('ga-script')) return;
  const s = document.createElement('script');
  s.id = 'ga-script';
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);

  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) { (window as any).dataLayer.push(args); }
  (window as any).gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID);
}

function loadClarity() {
  if (document.getElementById('clarity-script')) return;
  const c = window as any;
  c['clarity'] = c['clarity'] || function (...a: any[]) { (c['clarity'].q = c['clarity'].q || []).push(a); };
  const t = document.createElement('script');
  t.id = 'clarity-script';
  t.async = true;
  t.src = `https://www.clarity.ms/tag/${CLARITY_ID}`;
  document.head.appendChild(t);
}

export function loadAnalytics() {
  loadGA();
  loadClarity();
}
