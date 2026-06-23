"use client";

import { motion } from "framer-motion";
import { Calendar, Eye, ChevronRight, Newspaper } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function PublicNewsPage() {
  const params = useParams();
  const locale = params?.locale || "az";

  // Mock News Data (In a real app, fetched from DB populated by Admin CMS)
  const newsList = [
    { 
      id: 1, 
      title: "Milli Debat Forumu 2026 Qeydiyyatlarına Start Verildi", 
      date: "15 May 2026", 
      views: 1240,
      excerpt: "Bu ilki forum əvvəlki illərdən fərqli olaraq süni intellekt mövzularını əhatə edəcək. Bütün gənclər dəvətlidir.",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" 
    },
    { 
      id: 2, 
      title: "Yeni Süni İntellekt (AI) Debat Modulu İstifadəyə Verildi", 
      date: "10 May 2026", 
      views: 3450,
      excerpt: "Gənclər artıq gecə-gündüz fərq etmədən platforma üzərindən AI ilə debat məşqləri edə bilərlər.",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" 
    },
    { 
      id: 3, 
      title: "Youth INC. Yeni İnkubasiya Proqramına Qəbul Elan Edir", 
      date: "05 May 2026", 
      views: 890,
      excerpt: "Yeni startap ideyası olan gənclər müraciət edərək 3 aylıq ödənişsiz akselerasiya proqramından faydalana bilərlər.",
      image: "https://images.unsplash.com/photo-1556761175-5973dc0f32d7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" 
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href={`/${locale}`} className="hover:text-primary transition-colors">Ana Səhifə</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Xəbərlər və Yeniliklər</span>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-wider mb-6"
          >
            Ən Son Hadisələr
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Xəbərlər Bloqu
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            DVC, Milli Debat Proqramı və Youth INC haqqında ən son yeniliklərdən xəbərdar olun.
          </motion.p>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsList.map((news, idx) => (
            <Link href={`/${locale}/news/${news.id}`} key={news.id}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full cursor-pointer"
              >
              {/* Image Container */}
              <div className="w-full h-48 md:h-56 overflow-hidden relative bg-muted">
                <img 
                  src={news.image} 
                  alt={news.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Newspaper className="w-3.5 h-3.5" /> DVC Xəbər
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 flex-1 flex flex-col">
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> {news.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-primary" /> {news.views} Baxış
                  </span>
                </div>
                
                <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {news.title}
                </h2>
                
                <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
                  {news.excerpt}
                </p>
                
                <div className="text-primary font-bold text-sm flex items-center mt-auto">
                  Ətraflı oxu <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              </motion.div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
