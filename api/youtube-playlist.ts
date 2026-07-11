import type { VercelRequest, VercelResponse } from '@vercel/node';

const PLAYLIST_ID = 'PLRX8hHCncTbi-bPiUtoCDGgTW5i-a_2IN';
const API_KEY = process.env.YOUTUBE_API_KEY;

async function getPublicVideoIds(videoIds: string[]): Promise<Set<string>> {
  const publicIds = new Set<string>();
  // YouTube API allows up to 50 ids per request
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const url = new URL('https://www.googleapis.com/youtube/v3/videos');
    url.searchParams.set('part', 'status');
    url.searchParams.set('id', batch.join(','));
    url.searchParams.set('key', API_KEY!);
    const response = await fetch(url.toString());
    const data = await response.json();
    for (const item of data.items ?? []) {
      if (item.status?.privacyStatus === 'public') {
        publicIds.add(item.id);
      }
    }
  }
  return publicIds;
}

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

    const publicIds = await getPublicVideoIds(videos.map(v => v.videoId));
    const publicVideos = videos.filter(v => publicIds.has(v.videoId));

    res.setHeader('Cache-Control', 's-maxage=3600');
    return res.status(200).json(publicVideos);
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
