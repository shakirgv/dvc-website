"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { useTranslation } from "@/lib/i18n-context";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

export function NewsSection() {
  const { t } = useTranslation();
  const params = useParams();
  const locale = (params?.locale as string) || "az";
  const [news, setNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      const { data } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      if (data) setNews(data);
      setIsLoading(false);
    };
    fetchNews();
  }, []);

  const formatDate = (dateString: string, lang: string) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    
    const monthsAz = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
    const monthsEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthsRu = ["Января", "Февраля", "Марта", "Апреля", "Мая", "Июня", "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"];
    
    const day = d.getDate();
    const year = d.getFullYear();
    const month = lang === 'az' ? monthsAz[d.getMonth()] : lang === 'en' ? monthsEn[d.getMonth()] : monthsRu[d.getMonth()];
    
    return `${day} ${month} ${year}`;
  };

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
            {t('news_section.badge')}
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold mb-6 text-foreground tracking-tight"
          >
            {t('news_section.title')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mb-8"
          >
            {t('news_section.subtitle')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link href={`/${locale}/news`} className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold transition-colors px-6 py-3 rounded-full border border-primary/20 hover:bg-primary/5">
              {t('news_section.view_all')} <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading ? (
            // Skeleton Loader
            [1, 2, 3].map((item) => (
              <div key={item} className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse">
                <div className="h-56 bg-muted"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 w-32 bg-muted rounded"></div>
                  <div className="h-6 w-full bg-muted rounded"></div>
                  <div className="h-6 w-2/3 bg-muted rounded"></div>
                  <div className="h-20 w-full bg-muted rounded"></div>
                </div>
              </div>
            ))
          ) : news.length > 0 ? (
            news.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group bg-card rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2 flex flex-col"
              >
                <Link href={`/${locale}/news/${item.id}`} className="flex flex-col h-full cursor-pointer">
                  <div className="relative h-56 overflow-hidden shrink-0">
                    <img 
                      src={item.image_url || "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=600&auto=format&fit=crop"} 
                      alt={item[`title_${locale}`]} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      {item[`category_${locale}`] || (locale === 'en' ? 'News' : locale === 'ru' ? 'Новости' : 'Yenilik')}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 font-medium">
                      <Calendar className="w-4 h-4 text-primary" />
                      {formatDate(item.created_at, locale)}
                    </div>
                    <div className="block mb-3">
                      <h3 className="text-xl font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {item[`title_${locale}`]}
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
                      {item[`excerpt_${locale}`]}
                    </p>
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:text-primary-neon transition-colors mt-auto">
                      {t('news_section.read_more')} <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-muted-foreground">
              Hazırda yeni xəbər yoxdur.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
