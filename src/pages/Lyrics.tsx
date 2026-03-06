import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion'; // AnimatePresence used for PdfViewer
import { Music, Download, Search, X } from 'lucide-react';
import { Layout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePageMeta } from '@/hooks/usePageMeta';
import { getResourcesData, type Song } from '@/lib/resourcesData';
import { downloadPdf, getPdfURL } from '@/lib/pdfStorage';

// ── PDF Viewer Modal ────────────────────────────────────────────────────────

function PdfViewer({ song, onClose }: { song: Song; onClose: () => void }) {
  const { t } = useTranslation();
  // default: chords if available, else lyrics
  const [mode, setMode] = useState<'chords' | 'lyrics'>(
    song.chordsPdfKey ? 'chords' : 'lyrics'
  );
  const [downloading, setDownloading] = useState(false);

  const activeKey = mode === 'chords' ? song.chordsPdfKey : song.lyricsPdfKey;
  const pdfUrl = activeKey ? getPdfURL(activeKey) : null;

  const handleDownload = async () => {
    if (!activeKey) return;
    setDownloading(true);
    const filename = mode === 'chords'
      ? `${song.title} - Lyrics & Chords.pdf`
      : `${song.title} - Lyrics.pdf`;
    try { await downloadPdf(activeKey, filename); }
    finally { setDownloading(false); }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex flex-col"
      onClick={onClose}
    >
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-background border-b shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-semibold text-sm truncate max-w-[40%]">{song.title}</p>

        {/* Toggle */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              mode === 'chords' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setMode('chords')}
            disabled={!song.chordsPdfKey}
          >
            {t('lyrics.view_chords')}
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              mode === 'lyrics' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setMode('lyrics')}
            disabled={!song.lyricsPdfKey}
          >
            {t('lyrics.view_lyrics')}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleDownload} disabled={!activeKey || downloading}>
            <Download className="h-4 w-4 mr-1" />
            {downloading ? '...' : t('lyrics.download')}
          </Button>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* PDF embed */}
      <div className="flex-1 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {pdfUrl ? (
          <iframe
            key={pdfUrl}
            src={pdfUrl}
            className="w-full h-full border-0"
            title={song.title}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            {t('lyrics.no_pdf')}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

const Lyrics = () => {
  usePageMeta('Lyrics & Chords', 'View and download PDF lyrics and chord sheets for Elpis Worship songs.');
  const { t } = useTranslation();
  const { songs } = getResourcesData();
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState<Song | null>(null);

  const filtered = songs.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

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
                    className="border-0 shadow-md overflow-hidden cursor-pointer select-none hover:shadow-lg transition-shadow"
                    onClick={() => setViewing(song)}
                  >
                    <CardContent className="p-0">
                      <div className="flex items-center gap-3 px-5 py-4 hover:bg-muted/40 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Music className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium flex-1">{song.title}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PDF Viewer */}
      <AnimatePresence>
        {viewing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <PdfViewer song={viewing} onClose={() => setViewing(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Lyrics;
