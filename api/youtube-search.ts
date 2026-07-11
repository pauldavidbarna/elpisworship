import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEY = process.env.YOUTUBE_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!API_KEY) return res.status(500).json({ error: 'API key not configured' });

  const q = req.query.q as string;
  if (!q) return res.status(400).json({ error: 'Missing query' });

  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('q', q);
  url.searchParams.set('type', 'video');
  url.searchParams.set('maxResults', '1');
  url.searchParams.set('key', API_KEY);

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok) return res.status(500).json({ error: data.error?.message });

    const item = data.items?.[0];
    if (!item) return res.status(404).json({ error: 'No video found' });

    res.setHeader('Cache-Control', 's-maxage=86400');
    return res.status(200).json({
      videoId: item.id.videoId,
      title: item.snippet.title,
    });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
