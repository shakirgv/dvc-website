"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n-context";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

export function ProgramsSection() {
  const { t } = useTranslation();
  const params = useParams();
  const locale = (params?.locale as string) || "az";
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      const { data } = await supabase
        .from("programs")
        .select("*")
        .eq("status", "Active")
        .order("order_index", { ascending: true })
        .limit(3);
      if (data) setPrograms(data);
      setIsLoading(false);
    };
    fetchPrograms();
  }, []);

  return (
    <section className="relative py-24 md:py-32 bg-background border-b border-black/5 dark:border-white/5 overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-sm font-medium mb-4"
            >
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping" />
              {t("programs.badge") || "Fəaliyyət Sahələrimiz"}
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight"
            >
              {t("programs.title") || "Proqramlar və Layihələr"}
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link href={`/${locale}/programs`} className="inline-flex items-center gap-2 text-foreground font-bold hover:text-primary transition-colors">
              Bütün Proqramlar <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="bg-card/50 rounded-3xl border border-white/10 h-80 animate-pulse"></div>
            ))
          ) : programs.length > 0 ? (
            programs.map((program, i) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative bg-card border border-white/10 rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col h-full"
              >
                {/* Background Decoration */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-[30px] group-hover:bg-primary/10 transition-colors" />
                
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 relative z-10 group-hover:bg-blue-500 group-hover:text-white text-blue-500 transition-colors duration-300">
                  <BookOpen className="w-7 h-7" />
                </div>
                
                <h3 className="text-2xl font-bold text-foreground mb-4 relative z-10 group-hover:text-primary transition-colors">
                  {program[`title_${locale}`]}
                </h3>
                
                <p className="text-muted-foreground line-clamp-4 relative z-10 flex-1 mb-8">
                  {program[`description_${locale}`]}
                </p>

                <Link href={program.link || `/${locale}/programs`} className="inline-flex items-center gap-2 text-sm font-bold text-primary relative z-10 group-hover:text-primary-hover w-max">
                  Ətraflı Öyrən <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-10">
              Proqramlar tezliklə əlavə olunacaq.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
