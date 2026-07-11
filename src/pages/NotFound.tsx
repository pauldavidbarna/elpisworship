import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Home, Music, Music2, Music3, Music4 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const floatingNotes = [
  { Icon: Music,  x: '10%', delay: 0,    duration: 4.5, size: 'h-6 w-6' },
  { Icon: Music2, x: '25%', delay: 0.8,  duration: 5.2, size: 'h-4 w-4' },
  { Icon: Music3, x: '50%', delay: 1.4,  duration: 4.0, size: 'h-8 w-8' },
  { Icon: Music4, x: '70%', delay: 0.3,  duration: 5.8, size: 'h-5 w-5' },
  { Icon: Music,  x: '85%', delay: 1.0,  duration: 4.2, size: 'h-7 w-7' },
  { Icon: Music2, x: '40%', delay: 2.0,  duration: 5.0, size: 'h-4 w-4' },
];

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background overflow-hidden">

      {/* Floating music notes */}
      {floatingNotes.map(({ Icon, x, delay, duration, size }, i) => (
        <motion.div
          key={i}
          className={`absolute bottom-0 text-primary/20 pointer-events-none ${size}`}
          style={{ left: x }}
          initial={{ y: '100vh', opacity: 0 }}
          animate={{ y: '-110vh', opacity: [0, 0.6, 0.6, 0] }}
          transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: 'linear',
            times: [0, 0.1, 0.9, 1],
          }}
        >
          <Icon className="w-full h-full" />
        </motion.div>
      ))}

      <div className="text-center space-y-6 px-4 relative z-10">
        {/* 404 number */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <motion.p
            className="text-[10rem] md:text-[14rem] font-black leading-none bg-gradient-to-br from-primary via-primary/70 to-primary/30 bg-clip-text text-transparent select-none"
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
          >
            404
          </motion.p>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-2xl md:text-3xl font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {t('not_found.title')}
        </motion.h1>

        {/* Path */}
        <motion.p
          className="text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{location.pathname}</span>
          <span className="ml-2">{t('not_found.message')}</span>
        </motion.p>

        {/* Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button asChild size="lg">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              {t('not_found.back_home')}
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
