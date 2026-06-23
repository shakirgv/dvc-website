"use client";

import { useParams } from "next/navigation";
import { Calendar, Eye, ChevronRight, Newspaper, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function NewsDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const locale = params?.locale || "az";

  // Mock Fetching News
  const newsItem = {
    id: 1,
    title: "Milli Debat Forumu 2026 Qeydiyyatlarına Start Verildi",
    date: "15 May 2026",
    views: 1245,
    content: `
      Hörmətli gənclər! Bu ilki "Milli Debat Forumu 2026" üçün qeydiyyat prosesinə start verilmişdir. 
      Forum bu il ilk dəfə olaraq Süni İntellekt (AI) texnologiyalarının cəmiyyətə təsiri mövzusunda keçiriləcək.

      Bütün ölkə üzrə universitet və regional klubların üzvləri, habelə debat təcrübəsi olan və ya olmayan hər kəs komanda formasında və ya fərdi olaraq müraciət edə bilər. Tədbir 3 gün ərzində baş tutacaq və final oyunları ölkənin qabaqcıl münsifləri tərəfindən qiymətləndiriləcək.
      
      Biz sizi bu möhtəşəm intellektual mühitin bir hissəsi olmağa dəvət edirik. Gəlin, fərqli fikirləri bir araya gətirək və ən yaxşı arqumentlərlə gələcəyimizi formalaşdıraq!
    `,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80&ixlib=rb-4.0.3"
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href={`/${locale}`} className="hover:text-primary transition-colors">Ana Səhifə</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/${locale}/news`} className="hover:text-primary transition-colors">Xəbərlər</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{newsItem.title}</span>
        </div>

        <Link href={`/${locale}/news`} className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Xəbərlərə qayıt
        </Link>

        {/* Hero Image */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full h-[300px] md:h-[450px] rounded-3xl overflow-hidden mb-8 relative border border-border shadow-md"
        >
          <img src={newsItem.image} alt={newsItem.title} className="w-full h-full object-cover" />
          <div className="absolute top-6 left-6 bg-background/80 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold text-foreground flex items-center gap-2 shadow-sm">
            <Newspaper className="w-4 h-4" /> DVC Rəsmi
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
              <Calendar className="w-4 h-4 text-primary" /> {newsItem.date}
            </span>
            <span className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg">
              <Eye className="w-4 h-4 text-primary" /> {newsItem.views} Baxış
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-8 leading-tight">{newsItem.title}</h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
            {newsItem.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-6 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
            <span className="text-sm font-bold text-muted-foreground">Bu xəbəri paylaş:</span>
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
