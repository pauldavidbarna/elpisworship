import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';

// Renders every page of a PDF as a canvas that fills the container's width. Used on
// touch devices, where an <iframe> PDF (iOS Safari especially) shows pages at their
// native size and ignores #view=FitH, so they get cut off on narrow screens.
const PdfPages = ({ url, title }: { url: string; title: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.floor(entry.contentRect.width);
      // Ignore tiny changes (e.g. the iOS toolbar collapsing) to avoid needless re-renders.
      setWidth((prev) => (Math.abs(prev - next) > 8 ? next : prev));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !width) return;
    let cancelled = false;
    let destroy: (() => void) | undefined;

    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
        const task = pdfjs.getDocument({ url });
        destroy = () => task.destroy();
        const doc = await task.promise;
        if (cancelled) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 3);
        for (let n = 1; n <= doc.numPages; n++) {
          const page = await doc.getPage(n);
          if (cancelled) return;
          const viewport = page.getViewport({ scale: (width / page.getViewport({ scale: 1 }).width) * dpr });
          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.style.width = '100%';
          canvas.style.display = 'block';
          canvas.setAttribute('aria-label', `${title} — ${n}/${doc.numPages}`);
          await page.render({ canvas, viewport }).promise;
          if (cancelled) return;
          // Show the first page as soon as it's ready instead of waiting for all of them.
          if (n === 1) {
            el.replaceChildren(canvas);
            setStatus('ready');
          } else {
            el.appendChild(canvas);
          }
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [url, width, title]);

  return (
    <div className="h-full overflow-y-auto overscroll-contain bg-white" data-lenis-prevent>
      {status === 'loading' && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
      {status === 'error' && (
        <p className="text-center text-muted-foreground py-16 px-4">
          <a href={url} target="_blank" rel="noopener noreferrer" className="underline">{title}.pdf</a>
        </p>
      )}
      <div ref={containerRef} className="space-y-2" />
    </div>
  );
};

export default PdfPages;
