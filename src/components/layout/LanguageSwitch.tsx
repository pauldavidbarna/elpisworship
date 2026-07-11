import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

const LanguageSwitch = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'gr' : 'en';
    localStorage.setItem('elpis-lang', newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="font-medium text-sm gap-1"
    >
      {i18n.language === 'en' ? (
        <>
          <span>🇬🇷</span>
          <span className="hidden sm:inline">GR</span>
        </>
      ) : (
        <>
          <span>🇬🇧</span>
          <span className="hidden sm:inline">EN</span>
        </>
      )}
    </Button>
  );
};

export default LanguageSwitch;
