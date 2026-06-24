"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { usePathname } from "next/navigation";
import { Locale } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { MOCK_AUTH } from "@/lib/mock-auth";
import { useTranslation } from "@/lib/i18n-context";

export function Navbar({ locale }: { locale?: Locale }) {
  const pathname = usePathname();
  const currentLang = locale || "az";
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<any>(null);
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
    setSession(MOCK_AUTH.getSession());
  }, []);

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
          {session ? (
            <Link 
              href={`/${currentLang}/dashboard`}
              className="hidden sm:flex px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-full transition-colors shadow-sm"
            >
              {t('navbar.dashboard')}
            </Link>
          ) : (
            <Link 
              href={`/${currentLang}/login`}
              className="hidden sm:flex px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-full transition-colors shadow-sm"
            >
              {t('navbar.dashboard')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
