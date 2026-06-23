"use client";

import { motion } from "framer-motion";
import { Mic, Lightbulb, ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ProgramsPage() {
  const params = useParams();
  const locale = params?.locale || "az";

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href={`/${locale}`} className="hover:text-primary transition-colors">Ana Səhifə</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Proqramlar</span>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Fəaliyyət Proqramlarımız
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            DVC gənclərin müxtəlif istiqamətlərdə inkişafını təmin etmək üçün iki əsas strateji proqram həyata keçirir.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* MDP Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card border-2 border-primary/20 rounded-3xl p-8 shadow-sm relative overflow-hidden group flex flex-col h-full"
          >
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none transition-transform group-hover:scale-150" />
            
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
              <Mic className="w-8 h-8 text-primary" />
            </div>
            
            <h2 className="text-3xl font-bold mb-4">Milli Debat Proqramı</h2>
            <p className="text-muted-foreground mb-8 flex-1">
              Gənclərin natiqlik, tənqidi düşüncə və araşdırma qabiliyyətlərini inkişaf etdirən, ölkənin ən böyük intellektual şəbəkəsi. Forumlar, turnirlər və təlimlər vasitəsilə liderlik bacarıqlarını formalaşdırır.
            </p>
            
            <Link 
              href={`/${locale}/programs/mdp`}
              className="mt-auto flex items-center justify-between px-6 py-4 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-hover transition-colors group/btn"
            >
              Ətraflı Bax <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Youth INC Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card border-2 border-yellow-500/20 rounded-3xl p-8 shadow-sm relative overflow-hidden group flex flex-col h-full"
          >
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none transition-transform group-hover:scale-150" />
            
            <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-6 border border-yellow-500/20">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
            </div>
            
            <h2 className="text-3xl font-bold mb-4">Youth INC.</h2>
            <p className="text-muted-foreground mb-8 flex-1">
              Gənc sahibkarlara dəstək, startap ekosisteminin inkişafı və innovativ ideyaların reallaşdırılması üçün inkubasiya və akselerasiya proqramı. Biznes ideyanızı reallığa çevirin.
            </p>
            
            <Link 
              href={`/${locale}/programs/youth-inc`}
              className="mt-auto flex items-center justify-between px-6 py-4 bg-yellow-500 text-white font-bold rounded-xl shadow-md hover:bg-yellow-600 transition-colors group/btn"
            >
              Ətraflı Bax <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
