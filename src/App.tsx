import { useEffect, useState, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "@/i18n";
import { loadFromSupabase } from "@/lib/supabase";
import { saveResourcesData } from "@/lib/resourcesData";
import { ThemeProvider } from "@/contexts/ThemeContext";
import SplashScreen from "@/components/SplashScreen";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const ElpisPlay = lazy(() => import("./pages/ElpisPlay"));
const Donate = lazy(() => import("./pages/Donate"));
const Shop = lazy(() => import("./pages/Shop"));
const Contact = lazy(() => import("./pages/Contact"));
const Resources = lazy(() => import("./pages/Resources"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/Admin"));
const Lyrics = lazy(() => import("./pages/Lyrics"));

const queryClient = new QueryClient();

const App = () => {
  const [ready, setReady] = useState(false);
  const [splashDone, setSplashDone] = useState(() => {
    if (sessionStorage.getItem('splash-shown')) return true;
    sessionStorage.setItem('splash-shown', '1');
    return false;
  });

  useEffect(() => {
    loadFromSupabase().then((data) => {
      if (data && Object.keys(data).length > 0) {
        saveResourcesData(data);
      }
      setReady(true);
    });
  }, []);

  if (!splashDone) {
    return (
      <ThemeProvider>
        <SplashScreen onDone={() => setSplashDone(true)} />
      </ThemeProvider>
    );
  }

  if (!ready) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </ThemeProvider>
    );
  }

  return (
  <ThemeProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/play" element={<ElpisPlay />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/lyrics" element={<Lyrics />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/admin" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
  );
};

export default App;
