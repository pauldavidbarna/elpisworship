import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Target, Heart, Lightbulb, Instagram } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import LazyImage from '@/components/ui/lazy-image';
import { useResourcesData } from '@/hooks/useResourcesData';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ClipReveal, RevealText } from '@/components/motion';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const About = () => {
  const { t } = useTranslation();
  usePageMeta('About', 'Learn about Elpis Worship — who we are, our mission and the team behind the music.');
  const { team } = useResourcesData();
  const shuffledTeam = useMemo(() => shuffle(team), [team]);

  const missionItems = [
    {
      icon: Target,
      title: t('about.mission_1_title'),
      description: t('about.mission_1'),
    },
    {
      icon: Heart,
      title: t('about.mission_2_title'),
      description: t('about.mission_2'),
    },
    {
      icon: Lightbulb,
      title: t('about.mission_3_title'),
      description: t('about.mission_3'),
    },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 md:py-32 hero-gradient text-white">
        <div className="container mx-auto px-4 text-center">
          <RevealText
            as="h1"
            trigger="mount"
            text={t('about.title')}
            className="font-display text-[42px] md:text-[62px] font-bold mb-6"
          />
          <RevealText
            as="p"
            split={false}
            trigger="mount"
            text={t('about.motto')}
            delay={0.35}
            className="text-xl text-white/80"
          />
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <RevealText
              as="h2"
              text={t('about.who_we_are')}
              className="font-display text-[32px] md:text-[44px] font-semibold mb-8 text-center"
            />
            <RevealText
              as="p"
              split={false}
              text={t('about.who_we_are_text')}
              delay={0.2}
              className="text-lg text-muted-foreground leading-relaxed text-center"
            />
          </div>
        </div>
      </section>

      {/* Our Name */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <RevealText
              as="h2"
              text={t('about.our_name')}
              className="font-display text-[32px] md:text-[44px] font-semibold mb-8"
            />
            <div className="inline-block mb-8">
              <RevealText
                text="ελπίς"
                delay={0.2}
                className="text-6xl md:text-8xl font-display font-black text-primary"
              />
            </div>
            <RevealText
              as="p"
              split={false}
              text={t('about.our_name_text')}
              delay={0.3}
              className="text-lg text-muted-foreground leading-relaxed"
            />
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div>
            <RevealText
              as="h2"
              text={t('about.our_mission')}
              className="font-display text-[32px] md:text-[44px] font-semibold mb-12 text-center"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {missionItems.map((item, index) => (
                <ClipReveal key={item.title} delay={index * 0.1}>
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
                </ClipReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div>
            <RevealText
              as="h2"
              text={t('about.meet_the_team')}
              className="font-display text-[32px] md:text-[44px] font-semibold mb-12 text-center"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {shuffledTeam.map((member, index) => (
                <ClipReveal key={member.id} delay={(index % 4) * 0.08} className="group">
                  <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <div className="aspect-square overflow-hidden bg-muted">
                      {member.image
                        ? <LazyImage src={member.image} alt={member.role} loading="lazy" wrapperClassName="w-full h-full" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" style={{ objectPosition: `${member.imagePosX ?? 50}% ${member.imagePosY ?? 50}%` }} />
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
                </ClipReveal>
              ))}
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
