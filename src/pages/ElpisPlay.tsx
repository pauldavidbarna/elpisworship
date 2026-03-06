import { useTranslation } from 'react-i18next';
import { usePageMeta } from '@/hooks/usePageMeta';
import { motion } from 'framer-motion';
import { Play, Music, ExternalLink } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// YouTube playlist ID extracted from the URL
const PLAYLIST_ID = 'PLRX8hHCncTbi-bPiUtoCDGgTW5i-a_2IN';
const YOUTUBE_PLAYLIST_URL = `https://www.youtube.com/playlist?list=${PLAYLIST_ID}`;

const ElpisPlay = () => {
  usePageMeta('Elpis Play', 'Watch and listen to Elpis Worship music — worship sessions, live recordings and more.');
  const { t, i18n } = useTranslation();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 hero-gradient overflow-hidden">
        <div className="container mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Play className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              {t('play.title')}
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              {t('play.subtitle')}
            </p>
            <Button
              asChild
              size="lg"
              className="text-lg px-8 py-6"
            >
              <a href={YOUTUBE_PLAYLIST_URL} target="_blank" rel="noopener noreferrer">
                <Music className="mr-2 h-5 w-5" />
                {t('play.open_youtube')}
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Embedded Playlist */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="overflow-hidden border-0 shadow-2xl max-w-5xl mx-auto">
              <CardContent className="p-0">
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/videoseries?list=${PLAYLIST_ID}`}
                    title="Elpis Worship Playlist"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-10">
              <p className="text-muted-foreground mb-6">
                {t('play.subscribe_text')}
              </p>
              <Button
                asChild
                variant="outline"
                size="lg"
              >
                <a 
                  href="https://www.youtube.com/@ElpisWorship" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {t('play.subscribe')}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ElpisPlay;
