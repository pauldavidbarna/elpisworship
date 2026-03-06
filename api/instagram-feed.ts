import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const response = await fetch('https://feeds.behold.so/WjyyJ4QM1kPwV0kF3UoD');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const raw = data as { posts?: Array<{
      id: string;
      mediaType: string;
      sizes: { medium?: { mediaUrl: string } };
      permalink: string;
    }> } | Array<{
      id: string;
      mediaType: string;
      sizes: { medium?: { mediaUrl: string } };
      permalink: string;
    }>;

    const items = Array.isArray(raw) ? raw : (raw.posts ?? []);

    const posts = items.slice(0, 9).map((p) => ({
      id: p.id,
      mediaType: p.mediaType,
      imageUrl: p.sizes?.medium?.mediaUrl,
      permalink: p.permalink,
    })).filter((p) => p.imageUrl);

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
