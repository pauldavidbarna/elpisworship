import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { Layout } from '@/components/layout';
import { usePageMeta } from '@/hooks/usePageMeta';

const PrivacyPolicy = () => {
  usePageMeta('Privacy Policy', 'Privacy policy for Elpis Worship website.');
  const { i18n } = useTranslation();
  const isGr = i18n.language === 'gr';

  return (
    <Layout>
      <section className="py-20 md:py-28 hero-gradient text-white text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto px-4">
          <Shield className="h-14 w-14 mx-auto mb-4 text-primary" />
          <h1 className="font-display text-4xl md:text-5xl font-bold">
            {isGr ? 'Πολιτική Απορρήτου' : 'Privacy Policy'}
          </h1>
          <p className="text-white/60 mt-3 text-sm">
            {isGr ? 'Τελευταία ενημέρωση: Μάρτιος 2026' : 'Last updated: March 2026'}
          </p>
        </motion.div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-2xl prose prose-neutral dark:prose-invert">
          {isGr ? <ContentGR /> : <ContentEN />}
        </div>
      </section>
    </Layout>
  );
};

function ContentEN() {
  return (
    <div className="space-y-8 text-muted-foreground leading-relaxed">
      <Block title="1. Who We Are">
        Elpis Worship is a Christian worship band based in Athens, Greece. This privacy policy applies to our website at{' '}
        <a href="https://elpisworship.com" className="text-primary underline">elpisworship.com</a>.
        <br /><br />
        Contact: <a href="mailto:worshipelpis@gmail.com" className="text-primary underline">worshipelpis@gmail.com</a>
      </Block>

      <Block title="2. What Data We Collect">
        We do not collect personal data directly. However, if you give your consent, we use third-party analytics tools that may collect:
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Pages visited and time spent on the site</li>
          <li>Approximate geographic location (country/city level)</li>
          <li>Device type, browser, and operating system</li>
          <li>Referral source (how you found our site)</li>
        </ul>
        <br />
        If you use the contact form, your name, email address, and message are sent to us via email and are not stored on our servers.
      </Block>

      <Block title="3. Analytics Tools">
        With your consent, we use:
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <strong>Google Analytics 4</strong> — measures website traffic and user behavior.{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              Google Privacy Policy
            </a>
          </li>
          <li>
            <strong>Microsoft Clarity</strong> — records session data (anonymized) and heatmaps to improve user experience.{' '}
            <a href="https://privacy.microsoft.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              Microsoft Privacy Policy
            </a>
          </li>
        </ul>
        <br />
        These tools use cookies. If you decline consent, no cookies are set and no data is collected.
      </Block>

      <Block title="4. Legal Basis (GDPR)">
        We process analytics data based on your explicit consent (Article 6(1)(a) GDPR). You can withdraw consent at any time by clearing your browser cookies and declining on the banner next time you visit.
      </Block>

      <Block title="5. Your Rights">
        Under GDPR, you have the right to:
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Access the personal data we hold about you</li>
          <li>Request deletion of your data</li>
          <li>Withdraw consent at any time</li>
          <li>Lodge a complaint with your local data protection authority</li>
        </ul>
        <br />
        To exercise these rights, contact us at{' '}
        <a href="mailto:worshipelpis@gmail.com" className="text-primary underline">worshipelpis@gmail.com</a>.
      </Block>

      <Block title="6. Data Retention">
        Analytics data is retained according to the policies of Google and Microsoft (typically 14 months for Google Analytics). Contact form messages are retained in our email inbox and deleted when no longer needed.
      </Block>

      <Block title="7. Changes to This Policy">
        We may update this policy occasionally. The date at the top of this page indicates when it was last revised.
      </Block>
    </div>
  );
}

function ContentGR() {
  return (
    <div className="space-y-8 text-muted-foreground leading-relaxed">
      <Block title="1. Ποιοι Είμαστε">
        Η Elpis Worship είναι μια χριστιανική ομάδα λατρείας με έδρα την Αθήνα. Αυτή η πολιτική απορρήτου αφορά τον ιστότοπό μας στη διεύθυνση{' '}
        <a href="https://elpisworship.com" className="text-primary underline">elpisworship.com</a>.
        <br /><br />
        Επικοινωνία: <a href="mailto:worshipelpis@gmail.com" className="text-primary underline">worshipelpis@gmail.com</a>
      </Block>

      <Block title="2. Ποια Δεδομένα Συλλέγουμε">
        Δεν συλλέγουμε προσωπικά δεδομένα άμεσα. Ωστόσο, εάν δώσετε τη συγκατάθεσή σας, χρησιμοποιούμε εργαλεία ανάλυσης τρίτων που μπορεί να συλλέγουν:
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Σελίδες που επισκεφθήκατε και χρόνος παραμονής</li>
          <li>Κατά προσέγγιση γεωγραφική τοποθεσία (επίπεδο χώρας/πόλης)</li>
          <li>Τύπος συσκευής, πρόγραμμα περιήγησης και λειτουργικό σύστημα</li>
          <li>Πηγή παραπομπής (πώς βρήκατε τον ιστότοπό μας)</li>
        </ul>
        <br />
        Εάν χρησιμοποιήσετε τη φόρμα επικοινωνίας, το όνομα, η διεύθυνση email και το μήνυμά σας αποστέλλονται σε εμάς μέσω email και δεν αποθηκεύονται στους διακομιστές μας.
      </Block>

      <Block title="3. Εργαλεία Ανάλυσης">
        Με τη συγκατάθεσή σας, χρησιμοποιούμε:
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <strong>Google Analytics 4</strong> — μετράει την επισκεψιμότητα και τη συμπεριφορά χρηστών.{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              Πολιτική Απορρήτου Google
            </a>
          </li>
          <li>
            <strong>Microsoft Clarity</strong> — καταγράφει ανώνυμα δεδομένα συνεδρίας και χάρτες θερμότητας.{' '}
            <a href="https://privacy.microsoft.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              Πολιτική Απορρήτου Microsoft
            </a>
          </li>
        </ul>
        <br />
        Αυτά τα εργαλεία χρησιμοποιούν cookies. Εάν αρνηθείτε τη συγκατάθεση, δεν ορίζονται cookies και δεν συλλέγονται δεδομένα.
      </Block>

      <Block title="4. Νομική Βάση (GDPR)">
        Επεξεργαζόμαστε αναλυτικά δεδομένα βάσει της ρητής συγκατάθεσής σας (Άρθρο 6(1)(α) GDPR). Μπορείτε να αποσύρετε τη συγκατάθεσή σας ανά πάσα στιγμή διαγράφοντας τα cookies του προγράμματος περιήγησής σας.
      </Block>

      <Block title="5. Τα Δικαιώματά Σας">
        Σύμφωνα με τον GDPR, έχετε το δικαίωμα:
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Πρόσβασης στα προσωπικά δεδομένα που διατηρούμε για εσάς</li>
          <li>Αίτησης διαγραφής των δεδομένων σας</li>
          <li>Απόσυρσης της συγκατάθεσής σας ανά πάσα στιγμή</li>
          <li>Υποβολής καταγγελίας στην αρμόδια αρχή προστασίας δεδομένων</li>
        </ul>
        <br />
        Για να ασκήσετε αυτά τα δικαιώματα, επικοινωνήστε μαζί μας στο{' '}
        <a href="mailto:worshipelpis@gmail.com" className="text-primary underline">worshipelpis@gmail.com</a>.
      </Block>

      <Block title="6. Διατήρηση Δεδομένων">
        Τα αναλυτικά δεδομένα διατηρούνται σύμφωνα με τις πολιτικές της Google και της Microsoft (συνήθως 14 μήνες για το Google Analytics).
      </Block>

      <Block title="7. Αλλαγές στην Πολιτική">
        Ενδέχεται να ενημερώνουμε αυτή την πολιτική περιστασιακά. Η ημερομηνία στην κορυφή της σελίδας υποδεικνύει πότε αναθεωρήθηκε για τελευταία φορά.
      </Block>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-foreground mb-2">{title}</h2>
      <div className="text-sm">{children}</div>
    </div>
  );
}

export default PrivacyPolicy;
