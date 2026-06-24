"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n-context";
import { useParams } from "next/navigation";

export function AboutSection() {
  const { t } = useTranslation();
  const params = useParams();
  const locale = (params?.locale as string) || "az";

  const features = [
    t("about.feature_1") || "Gənclərin İnkişafı",
    t("about.feature_2") || "Təhsil Proqramları",
    t("about.feature_3") || "İnnovativ Yanaşma",
    t("about.feature_4") || "Karyera Dəstəyi",
  ];

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-background">
      {/* Premium Glow Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          {/* Image/Visual Side */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 w-full relative"
          >
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] md:aspect-square shadow-2xl border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop" 
                alt="About DVC" 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-8 left-8 z-20">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl">
                  <div className="text-4xl font-extrabold text-white mb-1">25+</div>
                  <div className="text-white/80 font-medium">İl Təcrübə</div>
                </div>
              </div>
            </div>
            
            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-gradient-to-br from-primary to-primary-neon rounded-full blur-[40px] opacity-30 animate-pulse" />
          </motion.div>

          {/* Content Side */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6 border border-primary/20">
              {t("about.badge") || "Haqqımızda"}
            </div>
            
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 leading-tight">
              {t("about.title") || "Gənclərin Gələcəyə Doğru İnkişaf Mərkəzi"}
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {t("about.description") || "Vətəndaş Cəmiyyətində Debat İctimai Birliyi (DVC) 1998-ci ildən bəri Azərbaycanda gənclərin fərdi və peşəkar inkişafına, təhsilinə və maarifləndirilməsinə xidmət edir. Bizim missiyamız hər bir gəncin potensialını kəşf etməsinə dəstək olmaqdır."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-semibold text-foreground text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <Link 
              href={`/${locale}/about`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background hover:bg-primary hover:text-white rounded-full font-bold transition-all hover:scale-105 shadow-xl shadow-black/10 dark:shadow-white/5"
            >
              {t("about.read_more") || "Daha Ətraflı"} <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
