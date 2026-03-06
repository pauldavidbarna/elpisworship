import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Download, ChevronDown, Search } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePageMeta } from '@/hooks/usePageMeta';
import { getResourcesData } from '@/lib/resourcesData';
import { downloadPdf } from '@/lib/pdfStorage';

const Lyrics = () => {
  usePageMeta('Lyrics & Chords', 'Download PDF lyrics and chord sheets for Elpis Worship songs.');
  const { t } = useTranslation();
  const { songs } = getResourcesData();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const filtered = songs.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = async (key: string, filename: string) => {
    setDownloading(key);
    try {
      await downloadPdf(key, filename);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 md:py-28 hero-gradient text-white text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4"
        >
          <Music className="h-14 w-14 mx-auto mb-4 text-primary" />
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
            {t('lyrics.title')}
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            {t('lyrics.subtitle')}
          </p>
        </motion.div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('lyrics.search')}
              className="pl-9"
            />
          </div>

          {/* Song list */}
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">{t('lyrics.no_songs')}</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((song, index) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Card
                    className="border-0 shadow-md overflow-hidden cursor-pointer select-none"
                    onClick={() => setExpanded(expanded === song.id ? null : song.id)}
                  >
                    <CardContent className="p-0">
                      {/* Header row */}
                      <div className="flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Music className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{song.title}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {song.lyricsPdfKey && (
                            <Badge variant="outline" className="text-xs hidden sm:inline-flex">Lyrics</Badge>
                          )}
                          {song.chordsPdfKey && (
                            <Badge variant="outline" className="text-xs hidden sm:inline-flex">Chords</Badge>
                          )}
                          <ChevronDown
                            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${expanded === song.id ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </div>

                      {/* Expanded download area */}
                      <AnimatePresence initial={false}>
                        {expanded === song.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="px-5 pb-5 pt-1 border-t border-border flex flex-col sm:flex-row gap-3">
                              <Button
                                className="flex-1"
                                variant="outline"
                                disabled={!song.lyricsPdfKey || downloading === song.lyricsPdfKey}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (song.lyricsPdfKey) handleDownload(song.lyricsPdfKey, `${song.title} - Lyrics.pdf`);
                                }}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                {downloading === song.lyricsPdfKey ? '...' : t('lyrics.download_lyrics')}
                              </Button>
                              <Button
                                className="flex-1"
                                disabled={!song.chordsPdfKey || downloading === song.chordsPdfKey}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (song.chordsPdfKey) handleDownload(song.chordsPdfKey, `${song.title} - Lyrics & Chords.pdf`);
                                }}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                {downloading === song.chordsPdfKey ? '...' : t('lyrics.download_chords')}
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Lyrics;
