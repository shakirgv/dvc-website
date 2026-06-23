"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { usePathname } from "next/navigation";
import { Locale } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { MOCK_AUTH } from "@/lib/mock-auth";

export function Navbar({ locale }: { locale?: Locale }) {
  const pathname = usePathname();
  const currentLang = locale || "az";
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<any>(null);

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
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-xl">DVC</span>
          </div>
          <span className="font-semibold text-xl tracking-tight hidden sm:block text-primary dark:text-primary-neon">
            Debat
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href={`/${currentLang}/about`} className="text-sm font-medium hover:text-primary transition-colors">
            Haqqımızda
          </Link>
          <Link href={`/${currentLang}/programs`} className="text-sm font-medium hover:text-primary transition-colors">
            Proqramlar
          </Link>
          <Link href={`/${currentLang}/centers`} className="text-sm font-medium hover:text-primary transition-colors">
            Mərkəzlər
          </Link>
          <Link href={`/${currentLang}/news`} className="text-sm font-medium hover:text-primary transition-colors">
            Xəbərlər
          </Link>
          <Link href={`/${currentLang}/contact`} className="text-sm font-medium hover:text-primary transition-colors">
            Əlaqə
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
              Kabinet
            </Link>
          ) : (
            <Link 
              href={`/${currentLang}/login`}
              className="hidden sm:flex px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-full transition-colors shadow-sm"
            >
              Daxil ol
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
