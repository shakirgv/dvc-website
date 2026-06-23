"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";

const NEWS = [
  {
    id: 1,
    title: "Milli Debat Proqramının Yeni Mövsümü Başlayır",
    category: "MDP",
    date: "15 Noyabr 2026",
    image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=600&auto=format&fit=crop",
    desc: "Bu ilki turnirdə ölkənin 40-dan çox universitetindən komandalar iştirak edəcək. Qeydiyyat artıq açıqdır."
  },
  {
    id: 2,
    title: "Youth INC Sahibkarlıq Proqramı Məzunlarını Yola Saldı",
    category: "Youth INC",
    date: "10 Noyabr 2026",
    image: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=600&auto=format&fit=crop",
    desc: "6 aylıq intensiv təlim və mentorluq proqramını uğurla başa vuran gənclər öz startaplarını təqdim etdilər."
  },
  {
    id: 3,
    title: "Süni İntellekt Debat Modulu Test Mərhələsindədir",
    category: "İnnovasiya",
    date: "5 Noyabr 2026",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop",
    desc: "DVC platformasında yaradılan yeni AI modulu ilə gənclər süni intellektə qarşı debat edə biləcəklər."
  }
];

export function NewsSection() {
  return (
    <section className="py-24 bg-card/30 border-y border-black/5 dark:border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            Yeniliklər
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold mb-6 text-foreground tracking-tight"
          >
            DVC-nin Nəbzi
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mb-8"
          >
            Həyata keçirdiyimiz layihələr, gənclərin qazandığı uğurlar və gələcək proqramlarımız haqqında ən son xəbərlərdən agah olun.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/news" className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold transition-colors px-6 py-3 rounded-full border border-primary/20 hover:bg-primary/5">
              Bütün xəbərlərə bax <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {NEWS.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group bg-card rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2"
            >
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  {item.category}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 font-medium">
                  <Calendar className="w-4 h-4 text-primary" />
                  {item.date}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-6">
                  {item.desc}
                </p>
                <Link href={`/news/${item.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:text-primary-neon transition-colors">
                  Daha ətraflı <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
