import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";

const Facebook = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const Instagram = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
const Linkedin = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>;
const Youtube = (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2.5 7.1C2.5 7.1 2.3 5.4 3.1 4.6 4.1 3.5 5.3 3.5 5.8 3.4 8.5 3.2 12 3.2 12 3.2s3.5 0 6.2.2c.6.1 1.7.1 2.7 1.2.8.8 1 2.5 1 2.5s.2 2 .2 4v2c0 2-.2 4-.2 4s-.2 1.7-1 2.5c-1 1.1-2.4 1-2.9 1.1-3 .3-6.1.3-6.1.3s-3.5 0-6.2-.2c-.6-.1-1.7-.1-2.7-1.2-.8-.8-1-2.5-1-2.5s-.2-2-.2-4v-2c0-2 .2-4 .2-4z"/><path d="M9.8 15.5l6.5-3.5-6.5-3.5z"/></svg>;

export function Footer() {
  return (
    <footer className="bg-card border-t border-black/5 dark:border-white/10 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white font-bold text-xl">DVC</span>
              </div>
              <span className="font-semibold text-xl tracking-tight text-primary dark:text-primary-neon">
                Debat
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Vətəndaş Cəmiyyətində Debat İctimai Birliyi olaraq gənclərin fərdi inkişafı və cəmiyyətdə aktiv iştirakı üçün platformalar yaradırıq.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all hover:scale-110"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all hover:scale-110"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all hover:scale-110"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all hover:scale-110"><Youtube className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-foreground">Sürətli Keçidlər</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">Haqqımızda</Link></li>
              <li><Link href="/programs/mdp" className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">Milli Debat Proqramı</Link></li>
              <li><Link href="/programs/youth-inc" className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">Youth INC</Link></li>
              <li><Link href="/news" className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">Xəbərlər və Media</Link></li>
            </ul>
          </div>

          {/* User Dashboard Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-foreground">İstifadəçi</h4>
            <ul className="space-y-3">
              <li><Link href="/login" className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">Kabinetə Giriş</Link></li>
              <li><Link href="/register" className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">Qeydiyyat</Link></li>
              <li><Link href="/play" className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">AI Debat Oyna</Link></li>
              <li><Link href="/certificates" className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">Sertifikat Yoxla</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-foreground">Əlaqə</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="leading-relaxed">Bakı şəh., Nəsimi rayonu, Səməd Vurğun küç. 43, AZ1014</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span className="font-medium">+994 12 345 67 89</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span className="font-medium">info@dvc.az</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-black/5 dark:border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground font-medium">
            &copy; {new Date().getFullYear()} DVC. Bütün hüquqlar qorunur.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium">
            <Link href="/privacy" className="hover:text-primary transition-colors">Məxfilik Siyasəti</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">İstifadə Şərtləri</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
