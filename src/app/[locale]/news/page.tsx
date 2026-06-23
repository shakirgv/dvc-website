"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Eye, ChevronRight, Newspaper } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PublicNewsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "az";

  const [newsList, setNewsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("status", "Active")
        .order("created_at", { ascending: false });
        
      if (data) {
        setNewsList(data);
      }
      setIsLoading(false);
    }
    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href={`/${locale}`} className="hover:text-primary transition-colors">
            {locale === "az" ? "Ana Səhifə" : locale === "en" ? "Home" : "Главная"}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">
            {locale === "az" ? "Xəbərlər və Yeniliklər" : locale === "en" ? "News & Updates" : "Новости и Обновления"}
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-wider mb-6"
          >
            {locale === "az" ? "Ən Son Hadisələr" : locale === "en" ? "Latest Events" : "Последние События"}
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            {locale === "az" ? "Xəbərlər Bloqu" : locale === "en" ? "News Blog" : "Блог Новостей"}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            {locale === "az" 
              ? "DVC, Milli Debat Proqramı və Youth INC haqqında ən son yeniliklərdən xəbərdar olun."
              : locale === "en"
              ? "Stay updated with the latest news about DVC, National Debate Program and Youth INC."
              : "Будьте в курсе последних новостей о DVC, Национальной программе дебатов и Youth INC."}
          </motion.p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsList.map((news, idx) => {
              // Dynamic Multi-language Fields
              const title = news[`title_${locale}`] || news.title_az || "Adı yoxdur";
              const excerpt = news[`excerpt_${locale}`] || news.excerpt_az || "";
              const dateObj = new Date(news.created_at);
              const formattedDate = dateObj.toLocaleDateString(
                locale === 'az' ? 'az-AZ' : locale === 'en' ? 'en-US' : 'ru-RU', 
                { day: 'numeric', month: 'short', year: 'numeric' }
              );

              return (
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
                      src={news.image_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"} 
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Newspaper className="w-3.5 h-3.5" /> DVC
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 md:p-8 flex-1 flex flex-col">
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-primary" /> {formattedDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-primary" /> {news.views} {locale === 'az' ? "Baxış" : locale === 'en' ? "Views" : "Просмотры"}
                      </span>
                    </div>
                    
                    <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {title}
                    </h2>
                    
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
                      {excerpt}
                    </p>
                    
                    <div className="text-primary font-bold text-sm flex items-center mt-auto">
                      {locale === 'az' ? "Ətraflı oxu" : locale === 'en' ? "Read more" : "Читать далее"} 
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}

        {!isLoading && newsList.length === 0 && (
          <div className="text-center text-muted-foreground py-12 bg-card border border-border rounded-3xl">
            {locale === "az" ? "Hazırda heç bir xəbər yoxdur." : locale === "en" ? "No news available at the moment." : "В настоящее время новостей нет."}
          </div>
        )}

      </div>
    </div>
  );
}
