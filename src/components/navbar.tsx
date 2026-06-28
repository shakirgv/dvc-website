"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { usePathname } from "next/navigation";
import { Locale } from "@/lib/i18n";
import { useEffect, useState, useRef } from "react";
import { Bell, Info, CheckCircle2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n-context";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar({ locale }: { locale?: Locale }) {
  const pathname = usePathname();
  const currentLang = locale || "az";
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [readNotifs, setReadNotifs] = useState<Set<string>>(new Set());
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        fetchNotifications(session.user.id);
      }
    };
    
    getUser();

    // Close notification dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchNotifications(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchNotifications = async (userId: string) => {
    // Sadece qlobal və ya istifadəçinin özünə ünvanlanan son 10 bildirişi gətir
    const { data: notifs } = await supabase
      .from("notifications")
      .select("*")
      .or(`target_user_ids.is.null,target_user_ids.cs.{${userId}}`)
      .order("created_at", { ascending: false })
      .limit(10);
      
    if (notifs) setNotifications(notifs);

    // Oxunmuş bildirişləri tap
    const { data: reads } = await supabase.from("notification_reads").select("notification_id").eq("user_id", userId);
    if (reads) {
      const readSet = new Set<string>();
      reads.forEach(r => readSet.add(r.notification_id));
      setReadNotifs(readSet);
    }
  };

  const markAsRead = async (notifId: string) => {
    if (!user || readNotifs.has(notifId)) return;
    
    // UI-ı anında yeniləyək
    setReadNotifs(prev => new Set(prev).add(notifId));
    
    // Backend-ə yazaq
    await supabase.from("notification_reads").insert({
      user_id: user.id,
      notification_id: notifId
    });
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const unreadNotifs = notifications.filter(n => !readNotifs.has(n.id));
    if (unreadNotifs.length === 0) return;

    // UI-ı anında yeniləyək
    const newReadSet = new Set(readNotifs);
    const inserts = unreadNotifs.map(n => {
      newReadSet.add(n.id);
      return { user_id: user.id, notification_id: n.id };
    });
    setReadNotifs(newReadSet);

    // Backend-ə yazaq
    await supabase.from("notification_reads").insert(inserts);
  };

  const unreadCount = notifications.filter(n => !readNotifs.has(n.id)).length;

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

  const isActive = (path: string) => {
    if (path === `/${currentLang}`) {
      return pathname === path;
    }
    return pathname?.startsWith(path) ?? false;
  };

  const navLinkClass = (path: string) => {
    return isActive(path)
      ? "text-sm font-bold text-primary transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-primary after:rounded-full"
      : "text-sm font-medium text-foreground/80 hover:text-primary transition-colors";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 dark:border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={`/${currentLang}`} className="flex items-center gap-2">
          <img src="/logo-transparent.png" alt="DVC Logo" className="h-16 md:h-20 w-auto object-contain" />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href={`/${currentLang}`} className={navLinkClass(`/${currentLang}`)}>
            {t('navbar.home')}
          </Link>
          <Link href={`/${currentLang}/about`} className={navLinkClass(`/${currentLang}/about`)}>
            {t('navbar.about')}
          </Link>
          <Link href={`/${currentLang}/programs`} className={navLinkClass(`/${currentLang}/programs`)}>
            {t('navbar.projects')}
          </Link>
          <Link href={`/${currentLang}/centers`} className={navLinkClass(`/${currentLang}/centers`)}>
            {t('navbar.centers')}
          </Link>
          <Link href={`/${currentLang}/partners`} className={navLinkClass(`/${currentLang}/partners`)}>
            {t('footer.partners')}
          </Link>
          <Link href={`/${currentLang}/news`} className={navLinkClass(`/${currentLang}/news`)}>
            {t('navbar.news')}
          </Link>
          <Link href={`/${currentLang}/contact`} className={navLinkClass(`/${currentLang}/contact`)}>
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
            <div className="hidden sm:flex items-center gap-4">
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2 text-muted-foreground hover:bg-muted/50 rounded-full transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[16px] h-4 bg-primary text-white text-[10px] font-bold rounded-full px-1 shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {isNotifOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 mt-3 w-80 sm:w-96 bg-card border border-border shadow-2xl rounded-2xl overflow-hidden z-50 origin-top-right"
                    >
                      <div className="p-4 border-b border-border/50 bg-muted/10 flex items-center justify-between">
                      <h4 className="font-bold text-sm">Bildirişlər</h4>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs font-medium text-primary hover:underline transition-all"
                        >
                          Hamısını oxunmuş et
                        </button>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center">
                          <Bell className="w-8 h-8 opacity-20 mb-2" />
                          Heç bir bildiriş yoxdur.
                        </div>
                      ) : (
                        notifications.map(n => {
                          const isRead = readNotifs.has(n.id);
                          return (
                            <div 
                              key={n.id} 
                              onClick={() => markAsRead(n.id)}
                              className={`p-4 border-b border-border/30 transition-all cursor-pointer flex gap-3 ${isRead ? 'opacity-60 bg-transparent' : 'bg-primary/5 hover:bg-primary/10'}`}
                            >
                              <div className={`mt-0.5 shrink-0 ${n.type === 'success' ? 'text-green-500' : n.type === 'warning' ? 'text-orange-500' : 'text-primary'}`}>
                                {n.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : n.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                              </div>
                              <div className="flex-1">
                                <p className={`text-sm mb-1 ${isRead ? 'font-medium text-foreground/80' : 'font-bold text-foreground'}`}>{n.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {n.content}
                                  {n.action_url && n.action_text && (
                                    <>
                                      {" - "}
                                      <a 
                                        href={n.action_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-primary font-bold hover:underline"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {n.action_text}
                                      </a>
                                    </>
                                  )}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-2 font-medium">
                                  {new Date(n.created_at).toLocaleString('az-AZ', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              {!isRead && (
                                <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>

              <div className="h-6 w-px bg-border mx-1" />

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
