import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './translations/en.json';
import gr from './translations/gr.json';

const resources = {
  en: { translation: en },
  gr: { translation: gr },
};

const savedLang = localStorage.getItem('elpis-lang');

// Default to Greek; IP detection will switch to English only for non-Greek IPs
const initialLang = (savedLang === 'en' || savedLang === 'gr') ? savedLang : 'gr';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

const langToLocale: Record<string, string> = { en: 'en', gr: 'el' };

const updateHtmlLang = (lang: string) => {
  document.documentElement.lang = langToLocale[lang] ?? lang;
};

updateHtmlLang(i18n.language);
i18n.on('languageChanged', updateHtmlLang);


// Run IP detection only for new visitors with no saved preference
if (!savedLang) {
  fetch('https://ip-api.com/json/?fields=countryCode')
    .then((r) => r.json())
    .then((data) => {
      if (data.countryCode !== 'GR') {
        i18n.changeLanguage('en');
      }
    })
    .catch(() => {/* stay on default 'gr' */});
}

export default i18n;
