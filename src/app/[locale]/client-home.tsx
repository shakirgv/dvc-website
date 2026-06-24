"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play, Bot, Users } from "lucide-react";
import { InteractiveMap } from "@/components/interactive-map";
import { NewsSection } from "@/components/news-section";
import { PartnerCarousel } from "@/components/partner-carousel";
import { AboutSection } from "@/components/about-section";
import { TeamSection } from "@/components/team-section";
import { ProgramsSection } from "@/components/programs-section";
import { useTranslation } from "@/lib/i18n-context";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface StatItem {
  id: string;
  stat_value: string;
  label_az: string; 
  label_en: string; 
  label_ru: string;
}

export function ClientHome() {
  const { t } = useTranslation();
  const params = useParams();
  const locale = (params?.locale as string) || "az";
  const [stats, setStats] = useState<StatItem[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from("home_stats")
        .select("*")
        .order("order_index", { ascending: true });
      if (data) setStats(data);
    };
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[128px] mix-blend-multiply dark:mix-blend-screen animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary-neon/20 rounded-full blur-[128px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container relative z-10 px-4 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary dark:text-primary-neon font-medium text-sm mb-8 border border-primary/20"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
            {t('hero.badge')}
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl"
          >
            {t('hero.title')} <br className="hidden md:block" />
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl max-w-2xl mb-10 text-gray-600 dark:text-gray-300"
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 max-w-4xl"
          >
            <Link 
              href="/register" 
              className="flex items-center gap-2 px-8 py-4 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold transition-all hover:scale-105 shadow-lg shadow-primary/30"
            >
              {t('hero.cta_join')} <ArrowRight className="w-5 h-5" />
            </Link>
            
            <Link 
              href={`/${locale}/rooms`} 
              className="flex items-center gap-2 px-8 py-4 rounded-full bg-blue-500/10 border border-blue-500/50 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 font-bold transition-all hover:scale-105 shadow-xl shadow-blue-500/20 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <Users className="w-5 h-5 text-blue-500" /> {t('hero.rooms')}
            </Link>
            
            <Link 
              href={`/${locale}/ai-partner`} 
              className="flex items-center gap-2 px-8 py-4 rounded-full bg-primary/10 border border-primary/50 text-primary hover:bg-primary/20 font-bold transition-all hover:scale-105 shadow-xl shadow-primary/20 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <Bot className="w-5 h-5 text-primary" /> {t('hero.ai_debat')}
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 border-t border-black/5 dark:border-white/10 pt-10 min-h-[100px]"
          >
            {stats.length > 0 ? stats.map((stat) => (
              <div key={stat.id} className="flex flex-col items-center">
                <span className="text-4xl font-bold text-foreground mb-2">{stat.stat_value}</span>
                <span className="text-sm text-gray-500 font-medium">{(stat as any)[`label_${locale}`]}</span>
              </div>
            )) : (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center animate-pulse">
                  <div className="h-10 w-24 bg-muted/50 rounded mb-2"></div>
                  <div className="h-5 w-20 bg-muted/50 rounded"></div>
                </div>
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <AboutSection />

      {/* Team Section */}
      <TeamSection />

      {/* Programs Section */}
      <ProgramsSection />

      {/* Interactive Map */}
      <InteractiveMap />

      {/* News Section */}
      <NewsSection />

      {/* Partners Carousel */}
      <PartnerCarousel />
    </div>
  );
}
