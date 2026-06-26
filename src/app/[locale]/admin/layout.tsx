"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { LayoutDashboard, Newspaper, Folders, Video, LogOut, Settings, MapPin, Users, Handshake, BarChart, BookOpen, Bell, History, UserCog, Mail, Library } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = params?.locale || "az";
  
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAdmin(false);
        router.push(`/${locale}/login`);
        return;
      }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      
      if (profile && profile.role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        router.push(`/${locale}`);
      }
    };

    checkAdmin();
  }, [pathname, router, locale]);

  if (isAdmin === null) return <div className="flex h-screen items-center justify-center bg-muted/30">Yüklənir...</div>; // loading state
  if (!isAdmin) return null; // Wait for redirect


  const menuItems = [
    { href: `/${locale}/admin`, icon: LayoutDashboard, label: "Statistika" },
    { href: `/${locale}/admin/users`, icon: UserCog, label: "İstifadəçilər" },
    { href: `/${locale}/admin/messages`, icon: Mail, label: "Gələn Mesajlar" },
    { href: `/${locale}/admin/broadcast`, icon: Bell, label: "Kütləvi Elan" },
    { href: `/${locale}/admin/news`, icon: Newspaper, label: "Xəbərlər" },
    { href: `/${locale}/admin/resources`, icon: Library, label: "Resurslar" },
    { href: `/${locale}/admin/centers`, icon: MapPin, label: "Mərkəzlər və Klublar" },
    { href: `/${locale}/admin/team`, icon: Users, label: "İdarə Heyəti" },
    { href: `/${locale}/admin/programs`, icon: BookOpen, label: "Proqramlar" },
    { href: `/${locale}/admin/projects`, icon: Folders, label: "Layihələr" },
    { href: `/${locale}/admin/projects/builder`, icon: Settings, label: "Form Builder" },
    { href: `/${locale}/admin/rooms`, icon: Video, label: "Debat Otaqları" },
    { href: `/${locale}/admin/partners`, icon: Handshake, label: "Tərəfdaşlar" },
    { href: `/${locale}/admin/stats`, icon: BarChart, label: "Ana Səhifə Sayğacları" },
    { href: `/${locale}/admin/audit`, icon: History, label: "Sistem Tarixçəsi" },
  ];

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col hidden md:flex shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-border">
          <Link href={`/${locale}/admin`} className="font-bold text-2xl tracking-tight flex items-center gap-2">
            <span className="bg-primary text-white p-1 rounded-lg">DVC</span> Admin
          </Link>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-border">
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              router.push(`/${locale}/login`);
            }}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-red-500 font-medium hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Çıxış et
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header for mobile or quick actions */}
        <header className="h-20 bg-card border-b border-border flex items-center justify-between px-6 shrink-0 md:justify-end">
          <div className="md:hidden font-bold text-xl">DVC Admin</div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Xoş gəldiniz, DVC Admin</span>
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
              DA
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
