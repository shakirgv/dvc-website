"use client";

import { motion } from "framer-motion";
import { Mic, Lightbulb, ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n-context";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProgramsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "az";
  const { t } = useTranslation();
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      const { data } = await supabase
        .from("programs")
        .select("*")
        .eq("status", "Active")
        .order("order_index", { ascending: true });
      if (data) setPrograms(data);
      setIsLoading(false);
    };
    fetchPrograms();
  }, []);

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href={`/${locale}`} className="hover:text-primary transition-colors">{t('navbar.home')}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{t('navbar.projects')}</span>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            {t('programs.title')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            {t('programs.subtitle')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="bg-card/50 rounded-3xl border border-white/10 h-80 animate-pulse"></div>
            ))
          ) : programs.length > 0 ? (
            programs.map((program, idx) => {
              const cardUrl = program.slug ? `/${locale}/programs/${program.slug}` : (program.link || `/${locale}/programs`);
              const logoOrBanner = program.banner_url || program.image_url || program.logo_url;
              const shortDesc = program[`short_desc_${locale}`] || program[`description_${locale}`];
              
              return (
                <motion.div 
                  key={program.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="h-full"
                >
                  <Link 
                    href={cardUrl}
                    className="bg-card border-2 border-primary/20 rounded-3xl p-8 shadow-sm relative overflow-hidden group flex flex-col h-full cursor-pointer hover:shadow-lg transition-all duration-300"
                  >
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none transition-transform group-hover:scale-150" />
                    
                    {logoOrBanner ? (
                      <div className="w-full h-48 rounded-2xl mb-6 overflow-hidden border border-border bg-white flex items-center justify-center p-1">
                        <img src={logoOrBanner} alt={program[`title_${locale}`]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 text-primary">
                        <Lightbulb className="w-8 h-8" />
                      </div>
                    )}
                    
                    <h2 className="text-2xl font-bold mb-4 line-clamp-2 group-hover:text-primary transition-colors">{program[`title_${locale}`]}</h2>
                    <p className="text-muted-foreground mb-8 flex-1 line-clamp-4">
                      {shortDesc}
                    </p>
                    
                    <div className="mt-auto flex items-center justify-between px-6 py-4 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-hover transition-colors group/btn">
                      {t('programs.viewMore') || "Ətraflı"} <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-10">
              Proqramlar tezliklə əlavə olunacaq.
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
