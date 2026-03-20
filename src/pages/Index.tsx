import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, MapPin, Clock, Instagram, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Layout } from '@/components/layout';
import heroImage from '@/assets/hero-worship.jpg';
import worshipNightBg from '@/assets/worship-night-bg.png';
import { getResourcesData } from '@/lib/resourcesData';
import { usePageMeta } from '@/hooks/usePageMeta';

interface IGPost {
  id: string;
  mediaType: string;
  imageUrl: string;
  permalink: string;
}

const Index = () => {
  const { t, i18n } = useTranslation();
  usePageMeta('Home', 'Elpis Worship — worship band dedicated to glorifying God through music.');
  const { events, heroImages } = getResourcesData();
  const upcomingEvents = events.filter((e) => e.type === 'upcoming').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const slides = heroImages.length > 0 ? heroImages : [{ src: heroImage, posY: 50 }];

  const [current, setCurrent] = useState(0);
  const [igPosts, setIgPosts] = useState<IGPost[]>([]);

  useEffect(() => {
    fetch('/api/instagram-feed')
      .then((r) => r.json())
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
              loading={idx === 0 ? 'eager' : 'lazy'}
              fetchPriority={idx === 0 ? 'high' : 'low'}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        </div>


        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight">
              {t('hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="text-lg px-8 py-6 glow-effect"
              >
                <Link to="/about">
                  {t('hero.cta_primary')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 bg-transparent border-white text-white hover:bg-white hover:text-black"
              >
                <Link to="/donate">{t('hero.cta_secondary')}</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 rounded-full border-2 border-white/50 flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-1.5 rounded-full bg-white/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* Worship Night Promo */}
      <section className="relative overflow-hidden bg-black">
        {/* Background photo */}
        <div className="absolute inset-0">
          <img
            src={worshipNightBg}
            alt="Worship Night"
            className="w-full h-full object-cover object-center"
          />
          {/* Dark + teal overlay matching poster mood */}
          <div className="absolute inset-0 bg-black/65" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#00c2cc]/10" />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-10 py-20 md:py-28">

          {/* Poster-style title */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-16 md:mb-20"
          >
            <p className="font-display font-black text-white uppercase leading-none tracking-tight text-5xl md:text-7xl lg:text-8xl">
              ELPIS
            </p>
            <p className="font-display font-black text-primary uppercase leading-none tracking-tight text-6xl md:text-8xl lg:text-9xl -mt-1 md:-mt-2">
              WORSHIP
            </p>
            <p
              className="text-white leading-none -mt-3 md:-mt-5 text-5xl md:text-7xl lg:text-8xl"
              style={{ fontFamily: "'Dancing Script', cursive" }}
            >
              night
            </p>
          </motion.div>

          {/* Divider */}
          <div className="border-t border-white/20 mb-10" />

          {/* Event columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 max-w-3xl">

            {/* Thessaloniki */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col gap-3"
            >
              <div>
                <p className="text-white/50 text-xs uppercase tracking-[0.25em]">Ομιλητής</p>
                <p className="text-white font-bold text-sm uppercase tracking-wider mt-0.5">
                  ΣΩΤΗΡΗΣ ΜΠΟΥΚΗΣ
                </p>
              </div>
              <div>
                <p className="font-display font-black text-white text-3xl md:text-4xl leading-tight">
                  16 Απριλίου, 2026
                </p>
                <p className="font-display font-black text-white text-2xl md:text-3xl">19:00</p>
              </div>
              <a
                href="https://maps.app.goo.gl/TnRvy1PA2Ki6Pe4YA"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-1"
              >
                <span className="bg-primary text-black font-black text-sm uppercase tracking-wide px-5 py-2.5 rounded-md hover:bg-primary/90 transition-colors block text-center leading-tight">
                  ΘΕΣΣΑΛΟΝΙΚΗ<br />
                  <span className="font-semibold">ΙΩΑΝΝΗΣ ΒΕΛΛΙΔΗΣ (Δ.Ε.Θ.)</span>
                </span>
              </a>
              <p className="text-white/60 text-sm mt-1">
                ΕΙΣΟΔΟΣ <strong className="text-white">ΕΛΕΥΘΕΡΗ</strong>
              </p>
            </motion.div>

            {/* Athens */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col gap-3"
            >
              <div>
                <p className="text-white/50 text-xs uppercase tracking-[0.25em]">Ομιλητής</p>
                <p className="text-white font-bold text-sm uppercase tracking-wider mt-0.5">
                  ΘΕΟΔΟΣΗΣ ΚΑΡΒΟΥΝΑΚΗΣ
                </p>
              </div>
              <div>
                <p className="font-display font-black text-white text-3xl md:text-4xl leading-tight">
                  18 Απριλίου, 2026
                </p>
                <p className="font-display font-black text-white text-2xl md:text-3xl">18:00 &amp; 20:30</p>
              </div>
              <a
                href="https://maps.app.goo.gl/eo1Uq9KSuMnUULjK9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-1"
              >
                <span className="bg-primary text-black font-black text-sm uppercase tracking-wide px-5 py-2.5 rounded-md hover:bg-primary/90 transition-colors block text-center leading-tight">
                  ΑΘΗΝΑ<br />
                  <span className="font-semibold">ΛΑΣΚΑΡΙΔΟΥ 112, ΚΑΛΛΙΘΕΑ</span>
                </span>
              </a>
              <p className="text-white/60 text-sm mt-1">
                ΕΙΣΟΔΟΣ <strong className="text-white">ΔΩΡΕΑΝ ΜΕ ΚΡΑΤΗΣΗ ΘΕΣΗΣ</strong>
              </p>
              <a
                href="https://www.eventbrite.com/e/elpis-worship-night-tickets-1984665483888?aff=oddtdtcreator"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-5 py-2.5 rounded-md text-sm hover:bg-white/20 transition-colors w-fit"
              >
                <Ticket className="h-4 w-4" />
                {t('home.get_tickets')}
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Who We Are Preview */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
              {t('home.who_we_are_title')}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              {t('home.who_we_are_text')}
            </p>
            <Button asChild variant="outline" size="lg">
              <Link to="/about">
                {t('home.read_more')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
              {t('home.upcoming_events')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
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
                          <Ticket className="h-4 w-4" /> {t('home.get_tickets')}
                        </a>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Button asChild variant="outline">
                <Link to="/resources">
                  {t('home.view_all_events')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>}

      {/* Instagram Grid */}
      {igPosts.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Instagram className="h-6 w-6 text-primary" />
                <h2 className="font-display text-3xl md:text-4xl font-bold">{t('home.instagram_title')}</h2>
              </div>
            </motion.div>
            <div className="grid grid-cols-3 gap-1 sm:gap-2 max-w-3xl mx-auto">
              {igPosts.map((post, index) => (
                <motion.a
                  key={post.id}
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: (index % 9) * 0.05 }}
                  className="relative overflow-hidden group bg-muted" style={{ aspectRatio: '4/5' }}
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
                </motion.a>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild variant="outline" size="lg">
                <a href="https://instagram.com/elpisworship" target="_blank" rel="noopener noreferrer">
                  <Instagram className="mr-2 h-4 w-4" />
                  {t('home.instagram_cta')}
                </a>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-20 md:py-32 hero-gradient text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
              {t('about.motto')}
            </h2>
            <p className="text-lg text-white/80 mb-8">
              {t('donate.message')}
            </p>
            <Button
              asChild
              size="lg"
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90"
            >
              <Link to="/donate">
                {t('donate.cta')}
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
