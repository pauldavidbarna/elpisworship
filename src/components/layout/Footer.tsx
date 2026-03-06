import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Instagram, Youtube, Music } from 'lucide-react';
import logo from '@/assets/logo.svg';

const Footer = () => {
  const { t } = useTranslation();

  const quickLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/about', label: t('nav.about') },
    { path: '/lyrics', label: t('nav.lyrics') },
    { path: '/donate', label: t('nav.donate') },
    { path: '/resources', label: t('nav.resources') },
    { path: '/contact', label: t('nav.contact') },
  ];

  const socialLinks = [
    { href: 'https://instagram.com/elpisworship', icon: Instagram, label: 'Instagram' },
    { href: 'https://youtube.com/@elpisworship', icon: Youtube, label: 'YouTube' },
    { href: 'https://open.spotify.com/artist/6Vpsb6n5cBmH3midkqMeE0?si=8WeWEnprTZWeZfXx1cRt1g', icon: Music, label: 'Spotify' },
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Tagline */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img src={logo} alt="Elpis Worship" className="h-16 w-auto" />
            </Link>
            <p className="text-sm text-secondary-foreground/70">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">{t('footer.quick_links')}</h4>
            <nav className="grid grid-cols-2 gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-display font-semibold mb-4">{t('contact.follow_us')}</h4>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-secondary-foreground/10 text-center space-y-2">
          <p className="text-sm text-secondary-foreground/50">
            {t('footer.copyright')}
          </p>
          <Link to="/privacy" className="text-xs text-secondary-foreground/40 hover:text-secondary-foreground/70 transition-colors">
            {t('cookie.privacy')}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
