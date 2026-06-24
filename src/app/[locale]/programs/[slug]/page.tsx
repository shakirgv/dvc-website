"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-context";
import { ChevronRight, ArrowLeft, ArrowRight, X, ChevronLeft, Calendar, FileText } from "lucide-react";
import Link from "next/link";

interface StatItem {
  value: string;
  label_az: string;
  label_en: string;
  label_ru: string;
}

interface ProgramItem {
  id: string;
  slug: string;
  logo_url: string;
  banner_url: string;
  title_az: string; title_en: string; title_ru: string;
  short_desc_az: string; short_desc_en: string; short_desc_ru: string;
  content_az: string; content_en: string; content_ru: string;
  stats_json: StatItem[];
  gallery_urls: string[];
  registration_link: string;
  is_registration_active: boolean;
  status: string;
  image_url?: string;
}

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "az";
  const slug = params?.slug as string;
  const { t } = useTranslation();

  const [program, setProgram] = useState<ProgramItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchProgramDetails = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("programs")
          .select("*")
          .eq("slug", slug)
          .eq("status", "Active")
          .single();

        if (error || !data) {
          setProgram(null);
        } else {
          // Normalize statistics JSON parsing
          let parsedStats: StatItem[] = [];
          if (data.stats_json) {
            parsedStats = typeof data.stats_json === "string" 
              ? JSON.parse(data.stats_json) 
              : data.stats_json;
          }

          setProgram({
            ...data,
            stats_json: Array.isArray(parsedStats) ? parsedStats : [],
            gallery_urls: Array.isArray(data.gallery_urls) ? data.gallery_urls : []
          });
        }
      } catch (err) {
        console.error("Error fetching program details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchProgramDetails();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <span className="text-muted-foreground font-medium animate-pulse">{t("common.loading") || "Yüklənir..."}</span>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md bg-card border border-border p-8 rounded-3xl shadow-xl flex flex-col items-center gap-6"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-3xl font-bold">!</div>
          <h2 className="text-2xl font-bold text-foreground">Proqram Tapılmadı</h2>
          <p className="text-muted-foreground text-sm">
            Axtardığınız proqram mövcud deyil və ya sistemdən silinmişdir.
          </p>
          <Link
            href={`/${locale}/programs`}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Proqramlara Qayıt
          </Link>
        </motion.div>
      </div>
    );
  }

  // Multi-lingual values fallback
  const title = program[`title_${locale}` as keyof ProgramItem] as string || program.title_az;
  const shortDesc = program[`short_desc_${locale}` as keyof ProgramItem] as string || program.short_desc_az;
  const content = program[`content_${locale}` as keyof ProgramItem] as string || program.content_az;

  const handleNextPhoto = () => {
    if (activePhotoIndex === null) return;
    setActivePhotoIndex((activePhotoIndex + 1) % program.gallery_urls.length);
  };

  const handlePrevPhoto = () => {
    if (activePhotoIndex === null) return;
    setActivePhotoIndex((activePhotoIndex - 1 + program.gallery_urls.length) % program.gallery_urls.length);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Header */}
      <section className="relative w-full h-[55vh] md:h-[65vh] flex items-end overflow-hidden">
        {/* Background Banner */}
        <div className="absolute inset-0 z-0">
          {program.banner_url ? (
            <img 
              src={program.banner_url} 
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-900/60 to-purple-900/60" />
          )}
          {/* Elegant Dark Gradients Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/30 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-transparent z-10 hidden md:block" />
        </div>

        <div className="container mx-auto px-4 max-w-6xl relative z-20 pb-10 w-full">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs md:text-sm text-white/70 mb-6 bg-black/25 backdrop-blur-md px-4 py-1.5 rounded-full w-max border border-white/5">
            <Link href={`/${locale}`} className="hover:text-primary transition-colors">{t("navbar.home") || "Ana Səhifə"}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/${locale}/programs`} className="hover:text-primary transition-colors">{t("navbar.projects") || "Proqramlar"}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium truncate max-w-[150px] md:max-w-none">{title}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
            {/* Title and Short description */}
            <div className="md:col-span-8 space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight drop-shadow-md"
              >
                {title}
              </motion.h1>
              {shortDesc && (
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-muted-foreground text-base md:text-lg max-w-2xl font-light leading-relaxed drop-shadow-sm line-clamp-3"
                >
                  {shortDesc}
                </motion.p>
              )}
            </div>

            {/* Circular Glassmorphic Logo Card */}
            <div className="md:col-span-4 flex justify-start md:justify-end">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-32 h-32 md:w-44 md:h-44 rounded-full border border-white/20 bg-white/10 backdrop-blur-lg flex items-center justify-center p-6 shadow-2xl shadow-black/45 hover:scale-105 transition-transform duration-300 animate-glow"
              >
                {program.logo_url ? (
                  <img 
                    src={program.logo_url} 
                    alt={`${title} Logo`}
                    className="w-full h-full object-contain filter drop-shadow-md"
                  />
                ) : (
                  <div className="text-white text-3xl font-bold tracking-wider">
                    {title.substring(0, 3).toUpperCase()}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="container mx-auto px-4 max-w-6xl mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Section - Rich Text Content & Gallery */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* HTML / Rich Text content */}
            <div className="bg-card border border-border p-6 md:p-10 rounded-3xl shadow-sm">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 border-b border-border pb-4">
                <FileText className="w-6 h-6 text-primary" />
                Proqram Haqqında
              </h2>
              {content ? (
                <div 
                  className="prose prose-slate dark:prose-invert max-w-none 
                    text-foreground/90 leading-relaxed space-y-4
                    [&>p]:text-base [&>p]:leading-relaxed
                    [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mt-8 [&>h1]:mb-4
                    [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-6 [&>h2]:mb-3
                    [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mt-4 [&>h3]:mb-2
                    [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2
                    [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-2
                    [&>li]:text-base
                    [&>strong]:font-semibold [&>strong]:text-foreground
                    [&>a]:text-primary [&>a]:underline [&>a]:hover:text-primary-hover
                    [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-4"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <p className="text-muted-foreground italic">Məlumat tezliklə əlavə olunacaq.</p>
              )}
            </div>

            {/* Foto Qalereya */}
            {program.gallery_urls && program.gallery_urls.length > 0 && (
              <div className="bg-card border border-border p-6 md:p-10 rounded-3xl shadow-sm space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-3 border-b border-border pb-4">
                  <Calendar className="w-6 h-6 text-primary" />
                  Foto Qalereya
                </h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {program.gallery_urls.map((url, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActivePhotoIndex(index)}
                      className="aspect-4/3 rounded-2xl overflow-hidden border border-border cursor-pointer relative group bg-muted"
                    >
                      <img 
                        src={url} 
                        alt={`${title} Gallery Image ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-sm">
                        Böyütmək üçün kliklə
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Section - Sticky Info Panel & Action CTA */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            
            {/* Sticky Glassmorphic Panel */}
            <div className="relative bg-card/60 backdrop-blur-xl border border-border rounded-3xl p-6 md:p-8 shadow-xl overflow-hidden">
              <div className="absolute -left-20 -top-20 w-40 h-40 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />
              <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none" />
              
              {/* Logo / Title in Sidebar */}
              <div className="flex items-center gap-4 mb-6 border-b border-border pb-5 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white border border-border flex items-center justify-center p-1.5 shrink-0">
                  <img src={program.logo_url || program.image_url} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground line-clamp-1">{title}</h3>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">İnfobox Göstəriciləri</span>
                </div>
              </div>

              {/* Dynamic Stats/Indicators */}
              {program.stats_json && program.stats_json.length > 0 ? (
                <div className="space-y-5 mb-8 relative z-10">
                  {program.stats_json.map((stat, i) => {
                    const label = stat[`label_${locale}` as keyof StatItem] || stat.label_az;
                    return (
                      <div key={i} className="flex items-center gap-4 bg-muted/30 border border-border/40 px-4 py-3 rounded-2xl">
                        <span className="text-2xl md:text-3xl font-extrabold text-primary shrink-0 min-w-[70px]">{stat.value}</span>
                        <div className="h-8 w-px bg-border/80" />
                        <span className="text-sm font-semibold text-foreground/90 leading-tight">{label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-muted-foreground text-sm italic mb-8 relative z-10 text-center">
                  Göstərici mövcud deyil
                </div>
              )}

              {/* Dynamic Registration CTA Button */}
              <div className="relative z-10">
                {program.is_registration_active ? (
                  <Link
                    href={program.registration_link || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-4 bg-primary hover:bg-primary-hover text-white font-extrabold text-center rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 transform active:scale-[0.99]"
                  >
                    Müraciət Et
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full py-4 bg-muted text-muted-foreground font-bold rounded-2xl border border-border/55 cursor-not-allowed text-center text-sm px-4"
                  >
                    Qeydiyyat cari mövsüm üçün başa çatıb
                  </button>
                )}
              </div>
            </div>

            {/* Quick Navigation Links */}
            <div className="flex items-center justify-between px-2 text-sm">
              <Link 
                href={`/${locale}/programs`}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Bütün Proqramlar
              </Link>
              <button 
                onClick={() => router.back()}
                className="text-muted-foreground hover:text-foreground font-semibold transition-colors"
              >
                Geri Dön
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* Lightbox / Gallery Slideshow Overlay */}
      <AnimatePresence>
        {activePhotoIndex !== null && program.gallery_urls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-6"
          >
            {/* Lightbox Top Panel */}
            <div className="flex justify-between items-center w-full text-white/80 z-20">
              <span className="text-sm font-semibold tracking-wide">
                Şəkil {activePhotoIndex + 1} / {program.gallery_urls.length}
              </span>
              <button 
                onClick={() => setActivePhotoIndex(null)}
                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Lightbox Content: Image & Nav buttons */}
            <div className="flex-1 flex items-center justify-center relative w-full select-none">
              
              {/* Prev Button */}
              {program.gallery_urls.length > 1 && (
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-2 md:left-6 p-3 md:p-4 bg-white/5 hover:bg-white/15 active:scale-95 rounded-full transition-all text-white z-25 cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                </button>
              )}

              {/* Main Image */}
              <motion.div
                key={activePhotoIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="max-w-[90%] max-h-[80vh] flex items-center justify-center overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
              >
                <img
                  src={program.gallery_urls[activePhotoIndex]}
                  alt={`${title} High Resolution Gallery ${activePhotoIndex + 1}`}
                  className="object-contain max-h-[80vh]"
                />
              </motion.div>

              {/* Next Button */}
              {program.gallery_urls.length > 1 && (
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-2 md:right-6 p-3 md:p-4 bg-white/5 hover:bg-white/15 active:scale-95 rounded-full transition-all text-white z-25 cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                </button>
              )}
            </div>

            {/* Lightbox Bottom Panel */}
            <div className="flex flex-col items-center gap-3 w-full text-white/80 pb-2 z-20">
              <span className="text-center font-bold text-base md:text-lg">{title}</span>
              
              {/* Mini thumbnails selection list */}
              {program.gallery_urls.length > 1 && (
                <div className="flex gap-2 overflow-x-auto max-w-[90vw] p-1.5 custom-scrollbar">
                  {program.gallery_urls.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhotoIndex(i)}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                        activePhotoIndex === i ? "border-primary scale-105" : "border-white/10 opacity-55 hover:opacity-100"
                      }`}
                    >
                      <img src={url} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
