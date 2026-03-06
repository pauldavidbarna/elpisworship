import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Target, Heart, Lightbulb, Instagram } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { getResourcesData } from '@/lib/resourcesData';
import { usePageMeta } from '@/hooks/usePageMeta';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const About = () => {
  const { t, i18n } = useTranslation();
  usePageMeta('About', 'Learn about Elpis Worship — who we are, our mission and the team behind the music.');
  const [{ team }] = useState(() => getResourcesData());
  const shuffledTeam = useMemo(() => shuffle(team), [team]);

  const missionItems = [
    {
      icon: Target,
      title: i18n.language === 'gr' ? 'Ευαγγελισμός' : 'Evangelism',
      description: t('about.mission_1'),
    },
    {
      icon: Heart,
      title: i18n.language === 'gr' ? 'Ενθάρρυνση' : 'Encouragement',
      description: t('about.mission_2'),
    },
    {
      icon: Lightbulb,
      title: i18n.language === 'gr' ? 'Έμπνευση' : 'Inspiration',
      description: t('about.mission_3'),
    },
  ];

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
            {t('about.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/80"
          >
            {t('about.motto')}
          </motion.p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-8 text-center">
              {t('about.who_we_are')}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-center">
              {t('about.who_we_are_text')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Name */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-8">
              {t('about.our_name')}
            </h2>
            <div className="inline-block mb-8">
              <span className="text-6xl md:text-8xl font-display font-black text-primary">
                ελπίς
              </span>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('about.our_name_text')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-12 text-center">
              {t('about.our_mission')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {missionItems.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full text-center border-0 shadow-lg">
                    <CardContent className="pt-8 pb-6 px-6">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                        <item.icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-display font-semibold text-xl mb-4">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-12 text-center">
              {t('about.meet_the_team')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {shuffledTeam.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <div className="aspect-square overflow-hidden bg-muted">
                      {member.image
                        ? <img src={member.image} alt={member.role} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" style={{ objectPosition: `${member.imagePosX ?? 50}% ${member.imagePosY ?? 50}%` }} />
                        : <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-4xl font-bold">{member.role[0]}</div>
                      }
                    </div>
                    <CardContent className="p-4 text-center">
                      {member.name && <p className="font-semibold text-sm">{member.name}</p>}
                      <p className="text-sm font-medium text-primary">{member.role}</p>
                      {member.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{member.description}</p>}
                      {member.instagram && (
                        <a
                          href={member.instagram.startsWith('http') ? member.instagram : `https://instagram.com/${member.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Instagram className="h-3 w-3" />
                          @{member.instagram.replace(/.*instagram\.com\//, '').replace(/\/$/, '')}
                        </a>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <p className="text-center text-muted-foreground mt-8">
              {i18n.language === 'gr'
                ? '...και ακόμα περισσότεροι ταλαντούχοι μουσικοί!'
                : '...and many more talented musicians!'}
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
