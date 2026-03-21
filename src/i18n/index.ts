import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './translations/en.json';
import gr from './translations/gr.json';

const resources = {
  en: { translation: en },
  gr: { translation: gr },
};

const savedLang = localStorage.getItem('elpis-lang');
const detectedLang = localStorage.getItem('elpis-lang-detected');

const initialLang = (savedLang === 'en' || savedLang === 'gr')
  ? savedLang
  : (detectedLang === 'en' || detectedLang === 'gr')
    ? detectedLang
    : 'gr';

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

// Do IP detection only if no saved preference and not yet detected
if (!savedLang && !detectedLang) {
  fetch('https://ip-api.com/json/?fields=countryCode')
    .then((r) => r.json())
    .then((data) => {
      const lang = data.countryCode === 'GR' ? 'gr' : 'en';
      localStorage.setItem('elpis-lang-detected', lang);
      i18n.changeLanguage(lang);
    })
    .catch(() => {/* stay on default 'gr' */});
}

export default i18n;
