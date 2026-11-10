import { useTranslation } from 'react-i18next';
import { Heart, Coffee, ExternalLink } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ClipReveal, PopIn, RevealText } from '@/components/motion';
import { usePageMeta } from '@/hooks/usePageMeta';

const Donate = () => {
  usePageMeta('Support Us', 'Support Elpis Worship ministry and help us continue creating music for His glory.');
  const { t } = useTranslation();

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 md:py-32 hero-gradient text-white">
        <div className="container mx-auto px-4 text-center">
          <PopIn trigger="mount" className="mb-6">
            <Heart className="h-16 w-16 text-primary" />
          </PopIn>
          <RevealText
            as="h1"
            trigger="mount"
            text={t('donate.title')}
            delay={0.15}
            className="font-display text-[42px] md:text-[62px] font-bold mb-6"
          />
          <RevealText
            as="p"
            split={false}
            trigger="mount"
            text={t('donate.subtitle')}
            delay={0.45}
            className="text-xl text-white/80 max-w-2xl mx-auto"
          />
        </div>
      </section>

      {/* Message & CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ClipReveal className="max-w-3xl mx-auto text-center">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-6 md:p-12">
                <PopIn delay={0.5} className="mb-6">
                  <Coffee className="h-12 w-12 text-primary" />
                </PopIn>
                <RevealText
                  as="p"
                  split={false}
                  text={t('donate.message')}
                  delay={0.5}
                  className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8"
                />
                <Button
                  asChild
                  size="lg"
                  className="btn-fill text-lg px-8 py-6 glow-effect w-full sm:w-auto"
                >
                  <a
                    href="https://buymeacoffee.com/elpisworship"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Coffee className="mr-2 h-5 w-5" />
                    {t('donate.cta')}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </ClipReveal>
        </div>
      </section>

      {/* Why Support */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <RevealText
              as="h2"
              text={t('donate.why_support')}
              className="font-display text-[32px] md:text-[44px] font-semibold mb-8 text-center"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: t('donate.support_1_title'),
                  description: t('donate.support_1_desc'),
                },
                {
                  title: t('donate.support_2_title'),
                  description: t('donate.support_2_desc'),
                },
                {
                  title: t('donate.support_3_title'),
                  description: t('donate.support_3_desc'),
                },
              ].map((item, index) => (
                <ClipReveal key={item.title} delay={index * 0.1}>
                  <Card className="h-full border-0 shadow-md">
                    <CardContent className="p-6 text-center">
                      <h3 className="font-display font-semibold text-lg mb-2">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
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
    </Layout>
  );
};

export default Donate;
