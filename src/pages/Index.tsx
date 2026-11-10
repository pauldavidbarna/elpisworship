import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Calendar, MapPin, Clock, Instagram, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Layout } from '@/components/layout';
import heroImage from '@/assets/hero-worship.jpg';

import { isUpcomingEvent } from '@/lib/resourcesData';
import { useResourcesData } from '@/hooks/useResourcesData';
import { usePageMeta } from '@/hooks/usePageMeta';
import { fetchCached } from '@/lib/apiCache';
import { ClipReveal, PopIn, RevealText } from '@/components/motion';
import { OUTLINE_FILL } from '@/lib/motion';

interface IGPost {
  id: string;
  mediaType: string;
  imageUrl: string;
  permalink: string;
}

const Index = () => {
  const { t, i18n } = useTranslation();
  usePageMeta('Home', 'Elpis Worship — worship band dedicated to glorifying God through music.');
  const { events, heroImages } = useResourcesData();
  const upcomingEvents = events.filter((e) => isUpcomingEvent(e)).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const activeHero = heroImages.filter((img) => img.enabled !== false);
  const slides = activeHero.length > 0 ? activeHero : [{ src: heroImage, posY: 50, enabled: true }];

  const [current, setCurrent] = useState(0);
  const [igPosts, setIgPosts] = useState<IGPost[]>([]);

  useEffect(() => {
    fetchCached<IGPost[]>('/api/instagram-feed')
      .then((data) => { if (Array.isArray(data)) setIgPosts(data.slice(0, 6)); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      i18n.language === 'gr' ? 'el-GR' : 'en-US',
      { day: 'numeric', month: 'long', year: 'numeric' }
    );
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Carousel */}
        <div className="absolute inset-0">
          {slides.map((slide, idx) => (
            <img
              key={idx}
              src={slide.src}
              alt="Elpis Worship"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
              style={{ opacity: idx === current ? 1 : 0, objectPosition: `50% ${slide.posY}%` }}
              loading="lazy"
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <RevealText
              as="h1"
              trigger="mount"
              text={t('hero.title')}
              delay={0.15}
              className="font-display text-[42px] md:text-[62px] font-bold text-white mb-6 tracking-tight"
            />
            <RevealText
              as="p"
              split={false}
              trigger="mount"
              text={t('hero.subtitle')}
              delay={0.5}
              className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto"
            />
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <PopIn trigger="mount" delay={0.9}>
                <Button asChild size="lg" className="btn-fill text-lg px-8 py-6 glow-effect">
                  <Link to="/about">
                    {t('hero.cta_primary')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </PopIn>
              <PopIn trigger="mount" delay={1.05}>
                <Button asChild variant="outline" size="lg" className="btn-fill [--btn-fill:white] text-lg px-8 py-6 bg-transparent border-white text-white hover:bg-transparent hover:text-black transition-colors duration-300">
                  <Link to="/donate">{t('hero.cta_secondary')}</Link>
                </Button>
              </PopIn>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are Preview */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <RevealText
              as="h2"
              text={t('home.who_we_are_title')}
              className="font-display text-[32px] md:text-[44px] font-semibold mb-6"
            />
            <RevealText
              as="p"
              split={false}
              text={t('home.who_we_are_text')}
              delay={0.2}
              className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed"
            />
            <PopIn delay={0.3}>
              <Button asChild variant="outline" size="lg" className={OUTLINE_FILL}>
                <Link to="/about">
                  {t('home.read_more')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </PopIn>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div>
            <RevealText
              as="h2"
              text={t('home.upcoming_events')}
              className="font-display text-[32px] md:text-[44px] font-semibold text-center mb-12"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {upcomingEvents.map((event, index) => (
                <ClipReveal key={event.id} delay={(index % 3) * 0.1}>
                  <Card className="h-full hover:shadow-lg transition-shadow border-0 bg-card">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 text-primary text-sm font-medium mb-3">
                        <Calendar className="h-4 w-4" />
                        {formatDate(event.date)}
                      </div>
                      <h3 className="font-display font-semibold text-lg mb-2">
                        {event.title}
                      </h3>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                        {event.locationUrl ? (
                          <a href={event.locationUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                            <MapPin className="h-3.5 w-3.5" />{event.location}
                          </a>
                        ) : (
                          <span className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{event.location}</span>
                        )}
                        {event.times && event.times.length > 0 && <span className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="h-3.5 w-3.5" />{event.times.join(' & ')}</span>}
                      </div>
                      {event.ticketUrl && (
                        <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                          <Ticket className="h-4 w-4" /> {t('home.free_ticket_cta')}
                        </a>
                      )}
                    </CardContent>
                  </Card>
                </ClipReveal>
              ))}
            </div>

            <div className="text-center mt-10">
              <PopIn>
                <Button asChild variant="outline" className={OUTLINE_FILL}>
                  <Link to="/resources">
                    {t('home.view_all_events')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </PopIn>
            </div>
          </div>
        </div>
      </section>}

      {/* Instagram Grid */}
      {igPosts.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <PopIn>
                  <Instagram className="h-6 w-6 text-primary" />
                </PopIn>
                <RevealText as="h2" text={t('home.instagram_title')} className="font-display text-[32px] md:text-[44px] font-semibold" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1 sm:gap-2 max-w-3xl mx-auto">
              {igPosts.map((post, index) => (
                <ClipReveal key={post.id} delay={(index % 3) * 0.08} className="bg-muted" innerClassName="relative">
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block overflow-hidden group" style={{ aspectRatio: '4/5' }}
                  >
                    <img
                      src={post.imageUrl}
                      alt="Elpis Worship on Instagram"
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Instagram className="h-8 w-8 text-white" />
                    </div>
                  </a>
                </ClipReveal>
              ))}
            </div>
            <div className="text-center mt-8">
              <PopIn>
                <Button asChild variant="outline" size="lg" className={OUTLINE_FILL}>
                  <a href="https://instagram.com/elpisworship" target="_blank" rel="noopener noreferrer">
                    <Instagram className="mr-2 h-4 w-4" />
                    {t('home.instagram_cta')}
                  </a>
                </Button>
              </PopIn>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-20 md:py-32 hero-gradient text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <RevealText
              as="h2"
              text={t('about.motto')}
              className="font-display text-[32px] md:text-[44px] font-semibold mb-6"
            />
            <RevealText
              as="p"
              split={false}
              text={t('donate.message')}
              delay={0.2}
              className="text-lg text-white/80 mb-8"
            />
            <PopIn delay={0.3}>
              <Button
                asChild
                size="lg"
                className="btn-fill text-lg px-8 py-6 bg-primary hover:bg-primary"
              >
                <Link to="/donate">
                  {t('donate.cta')}
                </Link>
              </Button>
            </PopIn>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
