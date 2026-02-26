import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Image, Video, Calendar, Megaphone, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getResourcesData, type Video as VideoType } from '@/lib/resourcesData';
import { getVideoURL } from '@/lib/videoDB';

function VideoPlayer({ video }: { video: VideoType }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    getVideoURL(video.dbKey).then(setUrl);
  }, [video.dbKey]);

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <div className="aspect-video bg-muted flex items-center justify-center">
        {url
          ? <video src={url} controls className="w-full h-full object-contain bg-black" />
          : <Video className="h-12 w-12 text-muted-foreground/30" />
        }
      </div>
      <CardContent className="p-4">
        <h3 className="font-display font-semibold">{video.title}</h3>
      </CardContent>
    </Card>
  );
}

const Resources = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('photos');
  const { photos, videos, events: allEvents, announcements } = getResourcesData();
  const events = {
    upcoming: allEvents.filter((e) => e.type === 'upcoming'),
    past: allEvents.filter((e) => e.type === 'past'),
  };

  // Lightbox state
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

  const openLightbox = (images: string[], index: number) => setLightbox({ images, index });
  const closeLightbox = () => setLightbox(null);
  const prevPhoto = () => lightbox && setLightbox({ ...lightbox, index: (lightbox.index - 1 + lightbox.images.length) % lightbox.images.length });
  const nextPhoto = () => lightbox && setLightbox({ ...lightbox, index: (lightbox.index + 1) % lightbox.images.length });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      i18n.language === 'gr' ? 'el-GR' : 'en-US',
      { day: 'numeric', month: 'long', year: 'numeric' }
    );
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 md:py-32 hero-gradient text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-6xl font-bold mb-6"
          >
            {t('resources.title')}
          </motion.h1>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-5xl mx-auto">
            <TabsList className="grid grid-cols-4 w-full mb-8">
              <TabsTrigger value="photos" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                <span className="hidden sm:inline">{t('resources.photos')}</span>
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                <span className="hidden sm:inline">{t('resources.videos')}</span>
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">{t('resources.events')}</span>
              </TabsTrigger>
              <TabsTrigger value="announcements" className="flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                <span className="hidden sm:inline">{t('resources.announcements')}</span>
              </TabsTrigger>
            </TabsList>

            {/* Photos Tab */}
            <TabsContent value="photos">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {photos.map((gallery) => (
                  <motion.div key={gallery.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                      {/* Cover image or placeholder */}
                      <div className="aspect-video overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        {gallery.images.length > 0
                          ? <img src={gallery.images[0]} className="w-full h-full object-cover" />
                          : <Image className="h-12 w-12 text-primary/30" />
                        }
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-display font-semibold">{gallery.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{gallery.images.length} {gallery.images.length === 1 ? 'photo' : 'photos'}</p>
                        {/* Thumbnail strip */}
                        {gallery.images.length > 0 && (
                          <div className="grid grid-cols-4 gap-1">
                            {gallery.images.slice(0, 4).map((src, idx) => (
                              <div
                                key={idx}
                                className="aspect-square overflow-hidden rounded cursor-pointer relative"
                                onClick={() => openLightbox(gallery.images, idx)}
                              >
                                <img src={src} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                                {idx === 3 && gallery.images.length > 4 && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-sm">
                                    +{gallery.images.length - 4}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Videos Tab */}
            <TabsContent value="videos">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map((video) => (
                  <motion.div key={video.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <VideoPlayer video={video} />
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events">
              <div className="space-y-8">
                <div>
                  <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                    <Badge className="bg-primary">{t('resources.upcoming')}</Badge>
                  </h3>
                  <div className="grid gap-4">
                    {events.upcoming.map((event) => (
                      <Card key={event.id} className="border-0 shadow-md">
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">{event.location}</p>
                          </div>
                          <Badge variant="outline">{formatDate(event.date)}</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                    <Badge variant="secondary">{t('resources.past')}</Badge>
                  </h3>
                  <div className="grid gap-4">
                    {events.past.map((event) => (
                      <Card key={event.id} className="border-0 shadow-md opacity-75">
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">{event.location}</p>
                          </div>
                          <Badge variant="outline">{formatDate(event.date)}</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Announcements Tab */}
            <TabsContent value="announcements">
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <motion.div key={announcement.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="border-0 shadow-md">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-display font-semibold text-lg">{announcement.title}</h3>
                          <Badge variant="outline">{formatDate(announcement.date)}</Badge>
                        </div>
                        <p className="text-muted-foreground">{announcement.content}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={closeLightbox}
          >
            <X className="h-8 w-8" />
          </button>

          {lightbox.images.length > 1 && (
            <>
              <button
                className="absolute left-4 text-white/80 hover:text-white"
                onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
              >
                <ChevronLeft className="h-10 w-10" />
              </button>
              <button
                className="absolute right-4 text-white/80 hover:text-white"
                onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
              >
                <ChevronRight className="h-10 w-10" />
              </button>
            </>
          )}

          <img
            src={lightbox.images[lightbox.index]}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <p className="absolute bottom-4 text-white/60 text-sm">
            {lightbox.index + 1} / {lightbox.images.length}
          </p>
        </div>
      )}
    </Layout>
  );
};

export default Resources;
