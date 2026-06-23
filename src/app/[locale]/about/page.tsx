"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Eye, Heart, Users, ChevronRight, CheckCircle2, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function AboutPage() {
  const params = useParams();
  const locale = params?.locale || "az";

  const team = [
    { name: "Şakir Qarayev", role: "Sədr", img: "ŞQ", bio: "Gənclər sektorunda 10 ildən artıq təcrübə. Müxtəlif beynəlxalq debat forumlarının təşkilatçısı və 20+ beynəlxalq layihənin iştirakçısı." },
    { name: "Leyla Məmmədova", role: "Layihələr üzrə Menecer", img: "LM", bio: "Layihələrin idarə olunması və komanda işinin təşkili üzrə mütəxəssis. 50+ lokal layihənin uğurlu icrası." },
    { name: "Rəşad Quliyev", role: "İctimaiyyətlə Əlaqələr", img: "RQ", bio: "DVC-nin media strategiyası və PR fəaliyyətinin tənzimləyicisi. Kreativ yanaşmalar və rəqəmsal marketinq." },
    { name: "Aysel Həsənova", role: "Regional İnkişaf", img: "AH", bio: "Regionlarda gənclər işinin inkişafı və yeni klubların yaradılması prosesinin rəhbəri. Bölgələrdə güclü əlaqə şəbəkəsi." },
  ];

  const [selectedMember, setSelectedMember] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href={`/${locale}`} className="hover:text-primary transition-colors">Ana Səhifə</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Haqqımızda</span>
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
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">İdarə Heyəti və Komanda</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Layihələrimizin və proqramlarımızın arxasında duran peşəkar və fədakar komandamız.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card border border-border rounded-3xl p-6 text-center shadow-sm group hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => setSelectedMember(member)}
              >
                <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center mb-4 text-2xl font-bold text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors">
                  {member.img}
                </div>
                <h3 className="font-bold text-lg">{member.name}</h3>
                <p className="text-sm text-primary font-medium mt-1 mb-4">{member.role}</p>
                
                <div className="flex items-center justify-center gap-3 pt-4 border-t border-border">
                  <a href="#" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-[#0077b5] hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  </a>
                  <a href="#" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-[#1877F2] hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                  </a>
                  <a href="#" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-[#E4405F] hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>

      {/* Member Detail Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-border rounded-3xl p-8 relative shadow-2xl"
            >
              <button onClick={() => setSelectedMember(null)} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-3xl font-bold text-primary border-4 border-card shadow-lg">
                  {selectedMember.img}
                </div>
                <h3 className="text-2xl font-bold">{selectedMember.name}</h3>
                <p className="text-primary font-medium mb-6">{selectedMember.role}</p>
                
                <div className="bg-muted/30 p-4 rounded-2xl border border-border text-sm leading-relaxed text-muted-foreground text-left w-full mb-6">
                  {selectedMember.bio}
                </div>

                <div className="flex items-center justify-center gap-4">
                  <a href="#" className="flex items-center gap-2 text-sm font-semibold text-[#0077b5] hover:underline">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg> LinkedIn
                  </a>
                  <a href="#" className="flex items-center gap-2 text-sm font-semibold text-[#E4405F] hover:underline">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> Instagram
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
