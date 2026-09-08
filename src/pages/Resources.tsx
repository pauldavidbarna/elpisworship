import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Image, Video, Calendar, Megaphone, X, ChevronLeft, ChevronRight, MapPin, Clock, Ticket } from 'lucide-react';

function EventTimes({ times }: { times?: string[] }) {
  if (!times || times.length === 0) return null;
  return (
    <span className="flex items-center gap-1 text-sm text-muted-foreground">
      <Clock className="h-3.5 w-3.5 shrink-0" />
      {times.join(' & ')}
    </span>
  );
}
import { Layout } from '@/components/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { isUpcomingEvent, isPastEvent, type Announcement, type Video as VideoType } from '@/lib/resourcesData';
import { useResourcesData } from '@/hooks/useResourcesData';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import LazyImage from '@/components/ui/lazy-image';
import { getVideoURL } from '@/lib/videoDB';
import { trackEvent } from '@/hooks/useAnalytics';

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
  usePageMeta('Resources', 'Browse Elpis Worship photos, videos, upcoming events and announcements.');
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('announcement') ? 'announcements' : 'photos');
  const { photos: rawPhotos, videos, events: allEvents, announcements: rawAnnouncements } = useResourcesData();
  const photos = [...rawPhotos].reverse();
  const announcements = [...rawAnnouncements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const events = {
    upcoming: allEvents.filter((e) => isUpcomingEvent(e)).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    past: allEvents.filter((e) => isPastEvent(e)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  };

  // Lightbox state
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

  // Announcement detail dialog state — synced to ?announcement=<id> so it can be
  // shared directly (e.g. as an ad destination URL) and opens straight to the card.
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const openAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    trackEvent('announcement_view', { announcement_title: announcement.title });
    const next = new URLSearchParams(searchParams);
    next.set('announcement', String(announcement.id));
    setSearchParams(next, { replace: true });
  };
  const closeAnnouncement = () => {
    setSelectedAnnouncement(null);
    const next = new URLSearchParams(searchParams);
    next.delete('announcement');
    setSearchParams(next, { replace: true });
  };

  // Auto-open the announcement named in the URL (deep link from an ad, etc.)
  useEffect(() => {
    const id = searchParams.get('announcement');
    if (!id) return;
    const found = announcements.find((a) => String(a.id) === id);
    if (found) {
      setActiveTab('announcements');
      setSelectedAnnouncement(found);
    }
  }, [searchParams, announcements]);

  const openLightbox = (images: string[], index: number, galleryTitle?: string) => {
    setLightbox({ images, index });
    trackEvent('photo_view', { gallery_title: galleryTitle ?? 'unknown' });
  };
  const closeLightbox = () => setLightbox(null);
  const lightboxRef = useFocusTrap(lightbox ? closeLightbox : undefined);
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
          <Tabs value={activeTab} onValueChange={(tab) => { setActiveTab(tab); trackEvent('tab_view', { tab_name: tab, page: 'resources' }); }} className="max-w-5xl mx-auto">
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
                          ? <LazyImage src={gallery.images[0]} alt={gallery.title} loading="lazy" wrapperClassName="w-full h-full" className="w-full h-full object-cover" onClick={() => openLightbox(gallery.images, 0, gallery.title)} />
                          : <Image className="h-12 w-12 text-primary/30" />
                        }
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-display font-semibold">{gallery.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{gallery.images.length} {gallery.images.length === 1 ? t('resources.photo') : t('resources.photos_count')}</p>
                        {/* Thumbnail strip */}
                        {gallery.images.length > 0 && (
                          <div className="grid grid-cols-4 gap-1">
                            {gallery.images.slice(0, 4).map((src, idx) => (
                              <div
                                key={idx}
                                className="aspect-square overflow-hidden rounded cursor-pointer relative"
                                onClick={() => openLightbox(gallery.images, idx, gallery.title)}
                              >
                                <LazyImage src={src} alt={gallery.title} loading="lazy" wrapperClassName="w-full h-full" className="w-full h-full object-cover hover:scale-105 transition-transform" />
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
                        <CardContent className="p-4 flex justify-between items-start gap-4">
                          <div className="space-y-1 flex-1">
                            <h4 className="font-semibold">{event.title}</h4>
                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                              {event.locationUrl ? (
                                <a href={event.locationUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                                  <MapPin className="h-3.5 w-3.5" />{event.location}
                                </a>
                              ) : (
                                <span className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{event.location}</span>
                              )}
                              <EventTimes times={event.times} />
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <Badge variant="outline">{formatDate(event.date)}</Badge>
                            {event.ticketUrl && (
                              <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors">
                                <Ticket className="h-3.5 w-3.5" /> Get Tickets
                              </a>
                            )}
                          </div>
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
                        <CardContent className="p-4 flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <h4 className="font-semibold">{event.title}</h4>
                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                              {event.locationUrl ? (
                                <a href={event.locationUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                                  <MapPin className="h-3.5 w-3.5" />{event.location}
                                </a>
                              ) : (
                                <span className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{event.location}</span>
                              )}
                              <EventTimes times={event.times} />
                            </div>
                          </div>
                          <Badge variant="outline" className="shrink-0">{formatDate(event.date)}</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Announcements Tab */}
            <TabsContent value="announcements">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {announcements.map((announcement) => (
                  <motion.div key={announcement.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex">
                    <Card
                      className="border-0 shadow-md overflow-hidden flex flex-col w-full cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => openAnnouncement(announcement)}
                    >
                      {announcement.image && (
                        <div className="aspect-video overflow-hidden">
                          <LazyImage src={announcement.image} alt={announcement.title} loading="lazy" wrapperClassName="w-full h-full" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <CardContent className="p-5 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <h3 className="font-display font-semibold text-base">{announcement.title}</h3>
                          <Badge variant="outline" className="shrink-0 text-xs">{formatDate(announcement.date)}</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm flex-1 line-clamp-2">{announcement.content}</p>
                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                          {t('resources.read_more')}
                        </span>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Announcement detail dialog */}
      <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && closeAnnouncement()}>
        <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedAnnouncement && (
            <>
              <DialogHeader className="text-left">
                <Badge variant="outline" className="w-fit mb-1">{formatDate(selectedAnnouncement.date)}</Badge>
                <DialogTitle className="text-2xl font-display">{selectedAnnouncement.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {selectedAnnouncement.image && (
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                    <img src={selectedAnnouncement.image} alt={selectedAnnouncement.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <p className="text-muted-foreground whitespace-pre-line">{selectedAnnouncement.content}</p>

                {selectedAnnouncement.link && (
                  <a
                    href={selectedAnnouncement.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 self-start text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                  >
                    {t('resources.read_more')}
                  </a>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {lightbox && (
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
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
            loading="lazy"
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
