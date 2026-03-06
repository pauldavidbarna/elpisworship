import { useState, useEffect } from 'react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { motion } from 'framer-motion';
import { Play, X, ExternalLink } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PLAYLIST_ID = 'PLRX8hHCncTbi-bPiUtoCDGgTW5i-a_2IN';
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY as string;

interface YTVideo {
  videoId: string;
  title: string;
  thumbnail: string;
}

async function fetchPlaylistVideos(): Promise<YTVideo[]> {
  const videos: YTVideo[] = [];
  let pageToken = '';

  do {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('playlistId', PLAYLIST_ID);
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('key', API_KEY);
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res = await fetch(url.toString());
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`);

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

  return videos;
}

const ElpisPlay = () => {
  usePageMeta('Elpis Play', 'Watch and listen to Elpis Worship music — worship sessions, live recordings and more.');

  const [videos, setVideos] = useState<YTVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<YTVideo | null>(null);

  useEffect(() => {
    fetchPlaylistVideos()
      .then((v) => { setVideos(v); if (v.length === 0) setError('Nu au fost găsite videoclipuri.'); })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 md:py-28 hero-gradient text-white text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto px-4">
          <Play className="h-14 w-14 mx-auto mb-4 text-primary" />
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">Elpis Play</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-6">
            Toate clipurile noastre — worship sessions, înregistrări live și mai mult.
          </p>
          <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-black">
            <a href={`https://www.youtube.com/playlist?list=${PLAYLIST_ID}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> Deschide pe YouTube
            </a>
          </Button>
        </motion.div>
      </section>

      {/* Videos Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-sm font-mono bg-muted p-4 rounded">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video, index) => (
                <motion.div
                  key={video.videoId}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (index % 6) * 0.05 }}
                >
                  <Card
                    className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
                    onClick={() => setActiveVideo(video)}
                  >
                    <div className="relative aspect-video bg-muted">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                          <Play className="h-6 w-6 text-white ml-1" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <p className="font-medium text-sm line-clamp-2">{video.title}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Video Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setActiveVideo(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={() => setActiveVideo(null)}
          >
            <X className="h-8 w-8" />
          </button>
          <div
            className="w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg"
              />
            </div>
            <p className="text-white mt-3 font-medium text-center">{activeVideo.title}</p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ElpisPlay;
