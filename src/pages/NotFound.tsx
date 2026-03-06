import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <p className="text-8xl font-black text-primary">404</p>
        <h1 className="text-2xl font-bold">{t('not_found.title')}</h1>
        <p className="text-muted-foreground">
          <span className="font-mono text-sm">{location.pathname}</span> — {t('not_found.message')}
        </p>
        <Button asChild>
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            {t('not_found.back_home')}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
