import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './translations/en.json';
import gr from './translations/gr.json';

const resources = {
  en: { translation: en },
  gr: { translation: gr },
};

const urlLang = new URLSearchParams(window.location.search).get('lang');
const savedLang = localStorage.getItem('elpis-lang');

const initialLang =
  urlLang === 'en' || urlLang === 'gr' ? urlLang :
  savedLang === 'en' || savedLang === 'gr' ? savedLang : 'gr';

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


export default i18n;
