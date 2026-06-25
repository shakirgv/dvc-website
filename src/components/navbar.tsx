"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { usePathname } from "next/navigation";
import { Locale } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n-context";

export function Navbar({ locale }: { locale?: Locale }) {
  const pathname = usePathname();
  const currentLang = locale || "az";
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = `/${currentLang}/login`;
  };

  const changeLanguage = (newLocale: string) => {
    if (!pathname) return `/${newLocale}`;
    const segments = pathname.split('/');
    if (segments.length > 1 && ['az', 'en', 'ru'].includes(segments[1])) {
      segments[1] = newLocale;
      return segments.join('/') || '/';
    }
    return `/${newLocale}${pathname}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 dark:border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={`/${currentLang}`} className="flex items-center gap-2">
          <img src="/logo-transparent.png" alt="DVC Logo" className="h-16 md:h-20 w-auto object-contain" />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href={`/${currentLang}`} className="text-sm font-medium hover:text-primary transition-colors">
            {t('navbar.home')}
          </Link>
          <Link href={`/${currentLang}/about`} className="text-sm font-medium hover:text-primary transition-colors">
            {t('navbar.about')}
          </Link>
          <Link href={`/${currentLang}/programs`} className="text-sm font-medium hover:text-primary transition-colors">
            {t('navbar.projects')}
          </Link>
          <Link href={`/${currentLang}/centers`} className="text-sm font-medium hover:text-primary transition-colors">
            {t('navbar.centers')}
          </Link>
          <Link href={`/${currentLang}/partners`} className="text-sm font-medium hover:text-primary transition-colors">
            {t('footer.partners')}
          </Link>
          <Link href={`/${currentLang}/news`} className="text-sm font-medium hover:text-primary transition-colors">
            {t('navbar.news')}
          </Link>
          <Link href={`/${currentLang}/contact`} className="text-sm font-medium hover:text-primary transition-colors">
            {t('footer.contact')}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm font-medium">
            <Link href={mounted ? changeLanguage('az') : '#'} className={`hover:text-primary transition-colors ${currentLang === 'az' ? 'text-primary font-bold' : 'text-gray-500'}`}>AZ</Link>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <Link href={mounted ? changeLanguage('en') : '#'} className={`hover:text-primary transition-colors ${currentLang === 'en' ? 'text-primary font-bold' : 'text-gray-500'}`}>EN</Link>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <Link href={mounted ? changeLanguage('ru') : '#'} className={`hover:text-primary transition-colors ${currentLang === 'ru' ? 'text-primary font-bold' : 'text-gray-500'}`}>RU</Link>
          </div>
          <ThemeToggle />
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link 
                href={`/${currentLang}/dashboard`}
                className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-full transition-colors"
              >
                {user.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name?.charAt(0) || ''}.` : t('navbar.dashboard')}
              </Link>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
              >
                Çıxış
              </button>
            </div>
          ) : (
            <Link 
              href={`/${currentLang}/login`}
              className="hidden sm:flex px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-full transition-colors shadow-sm"
            >
              {t('navbar.login') || "Daxil ol"}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
