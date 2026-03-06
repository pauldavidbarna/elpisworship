import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, Send, Instagram, Youtube, Music } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePageMeta } from '@/hooks/usePageMeta';

const Contact = () => {
  usePageMeta('Contact', 'Get in touch with Elpis Worship — send us a message or follow us on social media.');
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          subject: data.get('subject'),
          message: data.get('message'),
        }),
      });

      if (!res.ok) throw new Error('Failed');

      toast({
        title: i18n.language === 'gr' ? 'Επιτυχία!' : 'Success!',
        description: i18n.language === 'gr'
          ? 'Το μήνυμά σας εστάλη.'
          : 'Your message has been sent.',
      });

      form.reset();
    } catch {
      toast({
        title: i18n.language === 'gr' ? 'Σφάλμα' : 'Error',
        description: i18n.language === 'gr'
          ? 'Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.'
          : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    { href: 'https://instagram.com/elpisworship', icon: Instagram, label: 'Instagram', color: 'hover:text-pink-500' },
    { href: 'https://youtube.com/@elpisworship', icon: Youtube, label: 'YouTube', color: 'hover:text-red-500' },
    { href: 'https://open.spotify.com/artist/elpisworship', icon: Music, label: 'Spotify', color: 'hover:text-green-500' },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 md:py-32 hero-gradient text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Mail className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              {t('contact.title')}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="border-0 shadow-xl">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('contact.name')}</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        required 
                        placeholder={i18n.language === 'gr' ? 'Το όνομά σας' : 'Your name'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('contact.email')}</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        required 
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">{t('contact.subject')}</Label>
                      <Input 
                        id="subject" 
                        name="subject" 
                        required 
                        placeholder={i18n.language === 'gr' ? 'Θέμα μηνύματος' : 'Message subject'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">{t('contact.message')}</Label>
                      <Textarea 
                        id="message" 
                        name="message" 
                        required 
                        rows={5}
                        placeholder={i18n.language === 'gr' ? 'Το μήνυμά σας...' : 'Your message...'}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin">⏳</span>
                          {i18n.language === 'gr' ? 'Αποστολή...' : 'Sending...'}
                        </span>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          {t('contact.send')}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col justify-center"
            >
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">
                {t('contact.follow_us')}
              </h2>
              <div className="space-y-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group ${social.color}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <social.icon className="h-6 w-6" />
                    </div>
                    <span className="font-medium">{social.label}</span>
                  </a>
                ))}
              </div>

              <div className="mt-12 p-6 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground text-sm">
                  {i18n.language === 'gr' 
                    ? 'Για booking και συνεργασίες, στείλτε μας email ή επικοινωνήστε μέσω των social media.'
                    : 'For booking and collaborations, send us an email or reach out through social media.'}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
