import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Heart, Coffee, ExternalLink } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Donate = () => {
  const { t, i18n } = useTranslation();

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 md:py-32 hero-gradient text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Heart className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              {t('donate.title')}
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              {t('donate.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Message & CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8 md:p-12">
                <Coffee className="h-12 w-12 mx-auto mb-6 text-primary" />
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
                  {t('donate.message')}
                </p>
                <Button
                  asChild
                  size="lg"
                  className="text-lg px-8 py-6 glow-effect"
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
          </motion.div>
        </div>
      </section>

      {/* Why Support */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-8 text-center">
              {i18n.language === 'gr' ? 'Γιατί να μας Υποστηρίξετε' : 'Why Support Us'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: i18n.language === 'gr' ? 'Εξοπλισμός' : 'Equipment',
                  description: i18n.language === 'gr' 
                    ? 'Ήχος, μουσικά όργανα και τεχνικός εξοπλισμός'
                    : 'Sound, instruments, and technical equipment',
                },
                {
                  title: i18n.language === 'gr' ? 'Παραγωγή' : 'Production',
                  description: i18n.language === 'gr'
                    ? 'Ηχογράφηση, mixing και video production'
                    : 'Recording, mixing, and video production',
                },
                {
                  title: i18n.language === 'gr' ? 'Events' : 'Events',
                  description: i18n.language === 'gr'
                    ? 'Οργάνωση συναυλιών και εκδηλώσεων λατρείας'
                    : 'Organizing concerts and worship events',
                },
              ].map((item, index) => (
                <Card key={item.title} className="border-0 shadow-md">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-display font-semibold text-lg mb-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Donate;
