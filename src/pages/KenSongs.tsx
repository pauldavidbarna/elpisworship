import { ExternalLink, Music } from 'lucide-react';
import { Layout } from '@/components/layout';
import { motion } from 'framer-motion';

const songs = [
  { id: 1, greek: 'Βασιλιάδων Βασιλιάς', english: 'King Of Kings', url: 'https://www.youtube.com/watch?v=z3az3QkfVzE' },
  { id: 2, greek: 'Η καλοσύνη Σου, Θεέ', english: 'Goodness of God', url: 'https://www.youtube.com/watch?v=c_tKQZ0_URE' },
  { id: 3, greek: 'Μόνο ο Ιησούς', english: 'Only Jesus', url: 'https://www.youtube.com/watch?v=rze2eJQKPrg' },
  { id: 4, greek: 'Ελπίδα Ζωντανή', english: 'Living Hope', url: 'https://www.youtube.com/watch?v=ZgAoBLN4Dfo' },
  { id: 5, greek: 'Άγιος για πάντα', english: 'Holy Forever', url: 'https://www.youtube.com/watch?v=HUvqzUlYRT8' },
  { id: 6, greek: 'Η ελπίδα μου στηρίζεται', english: 'Cornerstone', url: 'https://www.youtube.com/watch?v=KnCtVzFpWts' },
  { id: 7, greek: 'Στη ζωή, στο θάνατο', english: 'Christ our Hope', url: 'https://www.youtube.com/watch?v=5Jh0x6tRHZ8' },
  { id: 8, greek: 'Δική σου η μάχη μου', english: 'Battle Belongs', url: 'https://youtu.be/FNRJSPwodiM?si=SK3QhOAo4nlknupj' },
  { id: 9, greek: 'Σε φουρτούνα', english: 'I Praise You in the Storm', url: 'https://www.youtube.com/watch?v=ByzF-H_W_oU' },
  { id: 10, greek: 'Νέο Όνομα', english: 'New Name', url: 'https://www.youtube.com/watch?v=qolViDJ4MOI' },
  { id: 11, greek: 'Μένεις πιστός', english: 'Ramai Isus', url: 'https://youtu.be/QjsPBb97sw4?si=EHcnun_TjK4-W_Ln' },
  { id: 12, greek: 'Η αγάπη του Θεού για μας', english: "How Deep the Father's Love", url: 'https://www.youtube.com/watch?v=z65YxhqY0_E' },
  { id: 13, greek: 'Ω Κύριε μου πόσο σε θαυμάζω', english: 'How Great Thou Art', url: 'https://www.youtube.com/watch?v=sFA4i4ZKLGo' },
  { id: 14, greek: 'Μες στον Χριστό', english: 'In Christ Alone', url: 'https://www.youtube.com/watch?v=m_063OI38RQ', note: 'varianta noastră' },
  { id: 15, greek: 'Αιώνιος Θεός', english: 'Ancient of Days', url: 'https://youtu.be/PPpGphzScjA?si=mWBmas5WC34TEpJP' },
  { id: 16, greek: 'Πόσο μεγάλο δώρο ο Χριστός μας', english: 'Yet Not I But Through Christ In Me', url: 'https://youtu.be/hwc2d1Xt8gM?si=P4LB6usy8krie1qy' },
  { id: 17, greek: 'Μπροστά στον θρόνο του Θεού', english: 'Before the Throne of God Above', url: 'https://youtu.be/vJ9yPsAm3Y0?si=v3GNUOckN4AsLIc_' },
  { id: 18, greek: 'Άξιος ο Αμνός', english: 'Worthy Is The Lamb', url: 'https://www.youtube.com/live/5e-VSQeGeKE?si=4fkEOCZs0wnTQEAB&t=1595' },
  { id: 19, greek: 'Χάρη κι έλεος είσαι', english: '', url: 'https://youtu.be/hv044puS_CI?si=AtfVAMVYZJ5x-9Ez' },
  { id: 20, greek: '', english: 'Only a Holy God', url: 'https://youtu.be/7HSdeeCm8_g?si=fK0mA_gSsmt-2CBT' },
  { id: 21, greek: 'Η δόξα ανήκει στον Θεό', english: 'Forever', url: 'https://www.youtube.com/watch?v=d6xxWGWpaUQ' },
  { id: 22, greek: 'Μεγάλε Θεέ', english: 'How Great is Our God', url: 'https://youtu.be/KBD18rsVJHk?si=Dx5dmn3BioxRMNQr' },
  { id: 23, greek: 'Δόξα στον Θεό, σε ρυάκια όταν περπατώ', english: 'Blessed Be Your Name', url: 'https://youtu.be/tTpTQ4kBLxA?si=VUcewhX_y1oeY7OI' },
  { id: 24, greek: 'Είσαι για μένα η δύναμη', english: 'You are My All in All', url: 'https://www.youtube.com/watch?v=xDZZ0-F5EKk' },
  { id: 25, greek: 'Όλη η γη κράζει σε Σε', english: 'God is Great', url: 'https://youtu.be/AV7C_AKq1kA?si=y_n9lQ6-ROunFN4J' },
  { id: 26, greek: 'Πιο πάνω απ᾽ όλα', english: 'Above All', url: 'https://www.youtube.com/watch?v=zbvvVwQcbus' },
  { id: 27, greek: 'Σ᾽ έχω ανάγκη', english: 'Lord I Need You', url: 'https://youtu.be/LuvfMDhTyMA?si=dUe0BZGKZkPG4Sny' },
  { id: 28, greek: 'Σου ανήκει η Δόξα', english: 'You Deserve the Glory', url: 'https://www.youtube.com/watch?v=wpbzcpzv0Tw' },
  { id: 29, greek: 'Τη στιγμή', english: '', url: 'https://www.youtube.com/watch?v=6QRnvCYTfro' },
  { id: 30, greek: 'Τι είμαι εγώ', english: 'Who Am I', url: 'https://youtu.be/3rT8Re1EIQc?si=uHysfXMHOSaxB3wk' },
  { id: 31, greek: 'Ήρθα να λάτρεψω', english: 'Here I Am to Worship', url: 'https://youtu.be/PtY3hWE3ToE?si=PR8i7A5lLi8U_c8i' },
  { id: 32, greek: 'Αυτός το σύμπαν συντηρεί (Δόξα στον Θεό)', english: '', url: 'https://www.youtube.com/watch?v=aSRovdgFtnI' },
  { id: 33, greek: 'Κύριέ μου Σε υψώνω', english: 'Lord I Lift Your Name on High', url: 'https://youtu.be/4Lyvn_lpyLk?si=TOuffUnVbNacJQs4' },
  { id: 34, greek: 'Ποιμένας μου ο Κύριος', english: "The Lord's My Shepherd", url: 'https://www.youtube.com/watch?v=pN4tPkX0MG0' },
  { id: 35, greek: 'Ποιος είμαι εγώ (Ευλογημένε Θεέ)', english: '', url: 'https://youtu.be/lms8bS3IV0Y?si=MuZ33E7h9BiMO3tM' },
  { id: 36, greek: 'Με το αίμα σου σώζεις', english: '', url: 'https://www.youtube.com/watch?v=wmE1wrfmHBw' },
];

export default function KenSongs() {
  return (
    <Layout>
      <section className="py-20 md:py-28 hero-gradient text-white text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-4"
        >
          <Music className="h-14 w-14 mx-auto mb-4 text-primary" />
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            KEN ELPIS SONGS
          </h1>
          <p className="text-white/60 mt-3 text-sm uppercase tracking-widest">
            {songs.length} τραγούδια
          </p>
        </motion.div>
      </section>

      <section className="py-14 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {songs.map((song, i) => (
              <motion.a
                key={song.id}
                href={song.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.025, duration: 0.3 }}
                className="group flex flex-col gap-1 rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200"
              >
                <span className="text-sm font-medium text-muted-foreground">
                  {song.id}
                </span>
                <span className="text-lg font-bold text-foreground leading-snug">
                  {song.greek || song.english}
                </span>
                {song.greek && song.english && (
                  <span className="text-sm text-muted-foreground">
                    {song.english}
                    {song.note && (
                      <span className="ml-2 text-xs italic text-muted-foreground/70">
                        ({song.note})
                      </span>
                    )}
                  </span>
                )}
                <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:underline">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Deschide pe YouTube
                </span>
              </motion.a>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
