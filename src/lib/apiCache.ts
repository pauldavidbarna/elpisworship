/**
 * Lightweight promise cache for API prefetching.
 * Call prefetchApi() early (e.g. in App.tsx) so data is ready
 * by the time the user navigates to the page that needs it.
 */
const cache = new Map<string, Promise<unknown>>();

function request(url: string): Promise<unknown> {
  return fetch(url).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });
}

/** Start fetching `url` in the background and store the promise. */
export function prefetchApi(url: string): void {
  if (!cache.has(url)) {
    cache.set(url, request(url));
  }
}

/**
 * Return the cached promise for `url`, or start a new request.
 * Pages call this instead of bare `fetch()` so they reuse the
 * prefetched result when available.
 */
export function fetchCached<T>(url: string): Promise<T> {
  if (!cache.has(url)) {
    cache.set(url, request(url));
  }
  return cache.get(url) as Promise<T>;
}
