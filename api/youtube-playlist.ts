import type { VercelRequest, VercelResponse } from '@vercel/node';

const PLAYLIST_ID = 'PLRX8hHCncTbi-bPiUtoCDGgTW5i-a_2IN';
const API_KEY = process.env.YOUTUBE_API_KEY;

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  if (!API_KEY) return res.status(500).json({ error: 'API key not configured' });

  const videos: { videoId: string; title: string; thumbnail: string }[] = [];
  let pageToken = '';

  try {
    do {
      const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
      url.searchParams.set('part', 'snippet');
      url.searchParams.set('playlistId', PLAYLIST_ID);
      url.searchParams.set('maxResults', '50');
      url.searchParams.set('key', API_KEY);
      if (pageToken) url.searchParams.set('pageToken', pageToken);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (!response.ok) return res.status(500).json({ error: data.error?.message });

      for (const item of data.items ?? []) {
        const snippet = item.snippet;
        if (snippet.resourceId?.videoId) {
          videos.push({
            videoId: snippet.resourceId.videoId,
            title: snippet.title,
            thumbnail:
              snippet.thumbnails?.maxres?.url ||
              snippet.thumbnails?.high?.url ||
              snippet.thumbnails?.medium?.url || '',
          });
        }
      }

      pageToken = data.nextPageToken ?? '';
    } while (pageToken);

    res.setHeader('Cache-Control', 's-maxage=3600');
    return res.status(200).json(videos);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
