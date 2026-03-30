import { useState, useEffect } from 'react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Play, X, ExternalLink, Youtube, RefreshCw } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchCached } from '@/lib/apiCache';

const PLAYLIST_ID = 'PLRX8hHCncTbi-bPiUtoCDGgTW5i-a_2IN';

interface YTVideo {
  videoId: string;
  title: string;
  thumbnail: string;
}

function fetchPlaylistVideos(): Promise<YTVideo[]> {
  return fetchCached<YTVideo[]>('/api/youtube-playlist');
}

const ElpisPlay = () => {
  usePageMeta('Elpis Play', 'Watch and listen to Elpis Worship music — worship sessions, live recordings and more.');
  const { t } = useTranslation();

  const [videos, setVideos] = useState<YTVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<YTVideo | null>(null);
  const closeVideo = () => setActiveVideo(null);
  const videoModalRef = useFocusTrap(activeVideo ? closeVideo : undefined);

  useEffect(() => {
    fetchPlaylistVideos()
      .then((v) => { setVideos(v); if (v.length === 0) setError(t('play.no_videos')); })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 md:py-28 hero-gradient text-white text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto px-4">
          <Play className="h-14 w-14 mx-auto mb-4 text-primary" />
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">{t('play.title')}</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-6">
            {t('play.description')}
          </p>
          <Button asChild className="bg-white text-black hover:bg-white/90">
            <a href="https://www.youtube.com/@ElpisWorship" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> {t('play.open_youtube')}
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
            <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
              <Youtube className="h-14 w-14 text-muted-foreground/30" />
              <div>
                <p className="text-lg font-semibold mb-1">{t('play.error_title')}</p>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">{t('play.error_message')}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  <RefreshCw className="h-4 w-4 mr-2" />{t('play.retry')}
                </Button>
                <Button asChild size="sm">
                  <a href="https://www.youtube.com/@ElpisWorship" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />{t('play.open_youtube')}
                  </a>
                </Button>
              </div>
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
                      <picture>
                        <source
                          type="image/webp"
                          srcSet={`https://i.ytimg.com/vi/${video.videoId}/hqdefault.webp`}
                        />
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </picture>
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
          ref={videoModalRef}
          role="dialog"
          aria-modal="true"
          aria-label={activeVideo.title}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeVideo}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={closeVideo}
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
