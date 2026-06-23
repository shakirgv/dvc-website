"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Calendar, Eye, ChevronRight, Newspaper, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { formatCustomDate } from "@/lib/formatDate";

export default function NewsDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const locale = (params?.locale as string) || "az";

  const [newsItem, setNewsItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNewsDetail() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", slug)
        .single();
        
      if (data) {
        setNewsItem(data);
        // İsteğe bağlı olarak baxış sayını artırmaq üçün update edə bilərsiniz:
        await supabase.from("news").update({ views: (data.views || 0) + 1 }).eq("id", slug);
      }
      setIsLoading(false);
    }
    if (slug) {
      fetchNewsDetail();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-20 flex justify-center items-center flex-col">
        <h1 className="text-2xl font-bold mb-4">{locale === "az" ? "Xəbər tapılmadı" : locale === "en" ? "News not found" : "Новость не найдена"}</h1>
        <Link href={`/${locale}/news`} className="text-primary hover:underline">
          {locale === "az" ? "Xəbərlərə qayıt" : locale === "en" ? "Back to news" : "Вернуться к новостям"}
        </Link>
      </div>
    );
  }

  // Dynamic Content based on Locale
  const title = newsItem[`title_${locale}`] || newsItem.title_az || "Untitled";
  const content = newsItem[`content_${locale}`] || newsItem.content_az || "";
  const dateObj = new Date(newsItem.created_at);
  const formattedDate = formatCustomDate(dateObj, locale);

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href={`/${locale}`} className="hover:text-primary transition-colors">
            {locale === "az" ? "Ana Səhifə" : locale === "en" ? "Home" : "Главная"}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/${locale}/news`} className="hover:text-primary transition-colors">
            {locale === "az" ? "Xəbərlər" : locale === "en" ? "News" : "Новости"}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{title}</span>
        </div>

        <Link href={`/${locale}/news`} className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> {locale === "az" ? "Xəbərlərə qayıt" : locale === "en" ? "Back to news" : "Вернуться к новостям"}
        </Link>

        {/* Hero Image */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full h-[300px] md:h-[450px] rounded-3xl overflow-hidden mb-8 relative border border-border shadow-md"
        >
          <img src={newsItem.image_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80&ixlib=rb-4.0.3"} alt={title} className="w-full h-full object-cover" />
          <div className="absolute top-6 left-6 bg-background/80 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold text-foreground flex items-center gap-2 shadow-sm">
            <Newspaper className="w-4 h-4" /> DVC
          </div>
        </motion.div>

        {/* Content Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-muted-foreground mb-6">
            <span className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg">
              <Calendar className="w-4 h-4 text-primary" /> {formattedDate}
            </span>
            <span className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg">
              <Eye className="w-4 h-4 text-primary" /> {newsItem.views} {locale === 'az' ? "Baxış" : locale === 'en' ? "Views" : "Просмотры"}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-8 leading-tight">{title}</h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
            {content.split('\n\n').map((paragraph: string, idx: number) => (
              <p key={idx} className="mb-6 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
            <span className="text-sm font-bold text-muted-foreground">{locale === 'az' ? "Bu xəbəri paylaş:" : locale === 'en' ? "Share this news:" : "Поделиться новостью:"}</span>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors font-semibold text-sm">Facebook</button>
              <button className="px-4 py-2 bg-[#0077b5]/10 text-[#0077b5] hover:bg-[#0077b5] hover:text-white rounded-lg transition-colors font-semibold text-sm">LinkedIn</button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
