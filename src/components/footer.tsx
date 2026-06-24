"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Mail, Phone, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n-context";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const Facebook = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const Instagram = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
const Linkedin = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>;
const Youtube = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2.5 7.1C2.5 7.1 2.3 5.4 3.1 4.6 4.1 3.5 5.3 3.5 5.8 3.4 8.5 3.2 12 3.2 12 3.2s3.5 0 6.2.2c.6.1 1.7.1 2.7 1.2.8.8 1 2.5 1 2.5s.2 2 .2 4v2c0 2-.2 4-.2 4s-.2 1.7-1 2.5c-1 1.1-2.4 1-2.9 1.1-3 .3-6.1.3-6.1.3s-3.5 0-6.2-.2c-.6-.1-1.7-.1-2.7-1.2-.8-.8-1-2.5-1-2.5s-.2-2-.2-4v-2c0-2 .2-4 .2-4z"/><path d="M9.8 15.5l6.5-3.5-6.5-3.5z"/></svg>;
const TwitterX = (props: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const Telegram = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 5 6 3-3 11-5-3-3.6 2.5a1 1 0 0 1-1.4-.4l-1-4-6-2 16-7z"/><path d="m9 15 3-4"/></svg>;

export function Footer() {
  const { t } = useTranslation();
  const params = useParams();
  const locale = params?.locale || "az";
  const [email, setEmail] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Future: Add Supabase insert here
    setEmail("");
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  return (
    <footer className="bg-card border-t border-black/5 dark:border-white/10 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
          {/* Brand & Socials */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <img src="/logo-transparent.png" alt="DVC Logo" className="h-20 md:h-24 w-auto object-contain bg-white/10 rounded-xl p-2" />
            </Link>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed max-w-sm">
              {t('footer.desc')}
            </p>
            <div className="flex items-center gap-4">
              <a href="https://www.facebook.com/dvcpu/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all hover:scale-110"><Facebook className="w-5 h-5" /></a>
              <a href="https://www.instagram.com/dvcpu/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all hover:scale-110"><Instagram className="w-5 h-5" /></a>
              <a href="https://www.linkedin.com/company/debate-in-civil-society-public-union" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all hover:scale-110"><Linkedin className="w-5 h-5" /></a>
              <a href="https://www.youtube.com/@DVCPUAZ/videos" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all hover:scale-110"><Youtube className="w-5 h-5" /></a>
              <a href="https://x.com/dvcpu" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all hover:scale-110"><TwitterX className="w-4 h-4" /></a>
              <a href="https://t.me/dvcpu" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all hover:scale-110"><Telegram className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Organization Links */}
          <div className="col-span-1 lg:col-span-2">
            <h4 className="font-bold text-lg mb-6 text-foreground">{t('footer.organization')}</h4>
            <ul className="space-y-3">
              <li><Link href={`/${locale}/about`} className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">{t('navbar.about')}</Link></li>
              <li><Link href={`/${locale}/programs`} className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">{t('navbar.projects')}</Link></li>
              <li><Link href={`/${locale}/centers`} className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">{t('navbar.centers')}</Link></li>
              <li><Link href={`/${locale}/news`} className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">{t('navbar.news')}</Link></li>
            </ul>
          </div>

          {/* Useful Links */}
          <div className="col-span-1 lg:col-span-2">
            <h4 className="font-bold text-lg mb-6 text-foreground">{t('footer.links')}</h4>
            <ul className="space-y-3">
              <li><Link href={`/${locale}/login`} className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">{t('navbar.login')}</Link></li>
              <li><Link href={`/${locale}/register`} className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">{t('navbar.join')}</Link></li>
              <li><Link href={`/${locale}/privacy`} className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link href={`/${locale}/terms`} className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">{t('footer.terms')}</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-1 lg:col-span-3">
            <h4 className="font-bold text-lg mb-6 text-foreground">{t('footer.newsletter')}</h4>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2 max-w-[260px]">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.newsletter_placeholder')} 
                className="w-full bg-background border border-border rounded-lg py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#733B96]/50 transition-all" 
                required 
              />
              <button 
                type="submit" 
                className="w-full bg-[#733B96] hover:bg-[#5E2F7A] text-white text-sm font-medium py-2 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {t('footer.subscribe')}
              </button>
            </form>
          </div>

          {/* Contact */}
          <div className="col-span-1 lg:col-span-2">
            <h4 className="font-bold text-lg mb-6 text-foreground">{t('footer.contact')}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <a href="https://www.google.com/maps/place/%22Youth+Inc%22+Business+Incubation+Center/@40.3670862,49.8368808,21z/data=!4m14!1m7!3m6!1s0x40307db9f653a013:0x68c12e788800424c!2s%22Youth+Inc%22+Business+Incubation+Center!8m2!3d40.3671002!4d49.8369556!16s%2Fg%2F11bw_59jmb!3m5!1s0x40307db9f653a013:0x68c12e788800424c!8m2!3d40.3671002!4d49.8369556!16s%2Fg%2F11bw_59jmb?entry=ttu&g_ep=EgoyMDI2MDYyMS4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="leading-relaxed hover:text-primary transition-colors cursor-pointer text-left">{t('footer.address')}</a>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <a href="tel:+994123456789" className="font-medium hover:text-primary transition-colors cursor-pointer text-left">+994 12 345 67 89</a>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <a href="mailto:info@dvc.az" className="font-medium hover:text-primary transition-colors cursor-pointer text-left">info@dvc.az</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-black/5 dark:border-white/10 pt-8 flex items-center justify-center">
          <p className="text-sm text-muted-foreground font-medium text-center">
            &copy; {new Date().getFullYear()} DVC. {t('footer.rights')}
          </p>
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-card border border-green-500/20 shadow-xl shadow-green-500/10 px-6 py-4 rounded-2xl"
          >
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <p className="font-medium text-sm">{t('footer.newsletter_success')}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
