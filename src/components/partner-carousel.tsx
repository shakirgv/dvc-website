"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-context";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PartnerItem {
  id: string;
  name_az: string;
  name_en: string;
  name_ru: string;
  logo_url: string;
  website_url: string;
}

export function PartnerCarousel() {
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const { t } = useTranslation();
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  useEffect(() => {
    const fetchPartners = async () => {
      const { data } = await supabase
        .from("partners")
        .select("*")
        .order("order_index", { ascending: true });
      if (data) setPartners(data);
    };
    fetchPartners();
  }, []);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeft(scrollLeft > 0);
      setShowRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    
    let observer: ResizeObserver | null = null;
    if (scrollContainerRef.current) {
      observer = new ResizeObserver(() => {
        handleScroll();
      });
      observer.observe(scrollContainerRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleScroll);
      if (observer) observer.disconnect();
    };
  }, [partners]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <section className="py-16 bg-muted/30 border-t border-black/5 dark:border-white/10 overflow-hidden relative">
      <div className="container mx-auto px-4 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center">{t('footer.partners')}</h2>
      </div>
      
      <div className="container mx-auto px-4 relative group">
        {showLeft && (
          <button 
            onClick={scrollLeft}
            className="absolute left-0 md:-left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background shadow-md border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="w-full flex items-center justify-center md:justify-start gap-12 overflow-x-auto snap-x snap-mandatory scroll-smooth py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {partners.length === 0 && (
            <div className="w-full text-center text-muted-foreground italic py-8">
              Tərəfdaşlar yüklənir və ya admin tərəfindən əlavə edilməyib...
            </div>
          )}
          {partners.length > 0 && partners.map((p) => (
            <a 
              key={p.id} 
              href={p.website_url || "#"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="shrink-0 snap-center flex items-center justify-center transition-all duration-300 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 hover:scale-110"
            >
              <img src={p.logo_url} alt={p.name_az} onLoad={handleScroll} className="h-16 md:h-20 object-contain max-w-[200px]" />
            </a>
          ))}
        </div>

        {showRight && (
          <button 
            onClick={scrollRight}
            className="absolute right-0 md:-right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background shadow-md border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </section>
  );
}
