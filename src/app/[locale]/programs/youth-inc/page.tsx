"use client";

import { motion } from "framer-motion";
import { Lightbulb, CheckCircle2, ChevronRight, Rocket, TrendingUp, Target } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function YouthIncPage() {
  const params = useParams();
  const locale = params?.locale || "az";

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href={`/${locale}`} className="hover:text-primary transition-colors">Ana Səhifə</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/${locale}/programs`} className="hover:text-primary transition-colors">Proqramlar</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Youth INC.</span>
        </div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border-2 border-yellow-500/20 rounded-3xl p-8 md:p-12 shadow-sm mb-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-yellow-500/10 flex items-center justify-center shrink-0 border border-yellow-500/20">
            <Lightbulb className="w-12 h-12 md:w-16 md:h-16 text-yellow-500" />
          </div>

          <div className="text-center md:text-left relative z-10 flex-1">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Youth INC. Sahibkarlıq Proqramı</h1>
            <p className="text-muted-foreground text-lg mb-6 max-w-2xl">
              Gənclərin startap ideyalarını dəstəkləyən, onlara biznes qurmaqda və investisiya cəlb etməkdə kömək edən unikal akselerasiya mərkəzi.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <Link 
                href={`/${locale}/login`}
                className="px-6 py-3 bg-yellow-500 text-white font-bold rounded-xl shadow-md hover:bg-yellow-600 transition-colors"
              >
                Müraciət Et
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-3xl p-8 shadow-sm"
            >
              <h2 className="text-2xl font-bold mb-4">Proqram Haqqında</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Youth INC. Gənclərin Sahibkarlıq Proqramı — DVC və Tərəfdaş Korporasiyaların birgə dəstəyi ilə yaradılmış, yeni başlayan bizneslərə (startaplara) hərtərəfli dəstək göstərən mərkəzdir.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                İnkubasiya və akselerasiya prosesləri vasitəsilə komandalar öz ideyalarını məhsula çevirir, biznes plan yazmağı öyrənir, mentorlardan dəstək alır və investorlar qarşısında çıxış edirlər (Pitching).
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-3xl p-8 shadow-sm"
            >
              <h2 className="text-2xl font-bold mb-6">Niyə Youth INC?</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                  <Rocket className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold">Akselerasiya və Mentorluq</h4>
                    <p className="text-sm text-muted-foreground mt-1">İlkin ideya mərhələsindən MVP yaradılmasına qədər hər bir addımda peşəkar ekspertlərdən və mentorlardan davamlı dəstək.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                  <Target className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold">İnvestisiya İmkanları</h4>
                    <p className="text-sm text-muted-foreground mt-1">İlkin (Seed) investisiya əldə etmək üçün lokal və beynəlxalq investor şəbəkəsi ilə birbaşa əlaqələrin qurulması.</p>
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>

          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-3xl p-8 shadow-sm sticky top-24"
            >
              <h2 className="text-xl font-bold mb-6">Faktlar</h2>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-center gap-3">
                  <Rocket className="w-5 h-5 text-yellow-500" />
                  <span>30+ Uğurlu Startap</span>
                </li>
                <li className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-yellow-500" />
                  <span>1M+ Məbləğində İnvestisiya</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-yellow-500" />
                  <span>Ödənişsiz İnkubasiya Mərkəzi</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  );
}
