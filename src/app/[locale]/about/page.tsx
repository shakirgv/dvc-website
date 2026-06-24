"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Eye, Heart, Users, ChevronRight, CheckCircle2, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n-context";
import { TeamSection } from "@/components/team-section";

export default function AboutPage() {
  const params = useParams();
  const locale = params?.locale || "az";

  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href={`/${locale}`} className="hover:text-primary transition-colors">Ana Səhifə</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{t('navbar.about')}</span>
        </div>

        {/* Hero */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-wider mb-6"
          >
            Vətəndaş Cəmiyyətində Debat
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold mb-6"
          >
            Gənclərin İnkişaf <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-neon">Platforması</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto"
          >
            Biz, gənclərin analitik düşüncə, natiqlik və liderlik bacarıqlarını inkişaf etdirərək onların cəmiyyətdə fəal rol almasını təmin edirik.
          </motion.p>
        </div>

        {/* Mission / Vision / Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border p-8 rounded-3xl shadow-sm relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors pointer-events-none" />
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
              <Target className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Missiyamız</h3>
            <p className="text-muted-foreground leading-relaxed">
              Azərbaycan gəncliyinin intellektual inkişafına dəstək olmaq, onları müasir dünyanın çağırışlarına hazırlamaq və qərarların qəbulu prosesində fəal iştirakını təmin etmək.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border p-8 rounded-3xl shadow-sm relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors pointer-events-none" />
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Eye className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Vizyonumuz</h3>
            <p className="text-muted-foreground leading-relaxed">
              Ölkənin ən geniş əhatəli və innovativ gənclər şəbəkəsini formalaşdırmaq, rəqabətədavamlı və açıqfikirli gənc nəslin yetişdirilməsində aparıcı güc olmaq.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border p-8 rounded-3xl shadow-sm relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-colors pointer-events-none" />
            <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6">
              <Heart className="w-7 h-7 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Dəyərlərimiz</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> İnklüzivlik və Bərabərlik</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> Analitik Düşüncə</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> Şəffaflıq</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> Komanda Ruhu</li>
            </ul>
          </motion.div>
        </div>

        {/* Team Section */}
        <TeamSection />

      </div>
    </div>
  );
}
