"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-context";
import { useParams } from "next/navigation";

interface PartnerItem {
  id: string;
  name_az: string;
  name_en: string;
  name_ru: string;
  category: "state" | "international" | "other";
  logo_url: string;
  website_url: string;
  order_index: number;
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const locale = (params?.locale as string) || "az";
  const { t } = useTranslation();

  useEffect(() => {
    const fetchPartners = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from("partners")
        .select("*")
        .order("order_index", { ascending: true });
      if (data) {
        setPartners(data);
      }
      setIsLoading(false);
    };
    fetchPartners();
  }, []);

  const statePartners = partners.filter(p => p.category === "state");
  const internationalPartners = partners.filter(p => p.category === "international");
  const otherPartners = partners.filter(p => p.category === "other");

  const getPartnerName = (p: PartnerItem) => {
    if (locale === "az") return p.name_az;
    if (locale === "en") return p.name_en;
    if (locale === "ru") return p.name_ru;
    return p.name_az;
  };

  const PartnerGrid = ({ title, items }: { title: string, items: PartnerItem[] }) => {
    if (items.length === 0) return null;
    
    return (
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-4">
          <span className="w-8 h-1 bg-primary rounded-full"></span>
          {title}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((p, index) => (
            <motion.a
              key={p.id}
              href={p.website_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-card/50 backdrop-blur-sm border border-black/5 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:border-primary/30 hover:bg-card hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 min-h-[160px]"
            >
              <div className="absolute top-4 right-4 opacity-0 -translate-y-2 translate-x-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300">
                <ExternalLink className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 flex items-center justify-center w-full">
                {p.logo_url ? (
                  <img src={p.logo_url} alt={getPartnerName(p)} className="max-w-[120px] max-h-[80px] object-contain grayscale group-hover:grayscale-0 transition-all duration-300" />
                ) : (
                  <span className="font-bold text-lg text-center text-muted-foreground group-hover:text-foreground transition-colors">
                    {getPartnerName(p)}
                  </span>
                )}
              </div>
              {p.logo_url && (
                <span className="text-sm font-medium text-center text-muted-foreground group-hover:text-foreground transition-colors">
                  {getPartnerName(p)}
                </span>
              )}
            </motion.a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-500/5 rounded-full blur-[100px] -z-10" />

      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 inline-block">
            {t('footer.partners')}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            DVC {t('footer.partners')}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Gənclərin inkişafı və debat mədəniyyətinin formalaşdırılması missiyamıza dəstək verən və bizimlə əməkdaşlıq edən dəyərli tərəfdaşlarımız.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p>Yüklənir...</p>
          </div>
        ) : partners.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground bg-card/30 rounded-3xl border border-black/5 dark:border-white/10 backdrop-blur-sm">
            Hələlik tərəfdaş əlavə edilməyib.
          </div>
        ) : (
          <div className="space-y-4">
            <PartnerGrid title={t('footer.partners_state')} items={statePartners} />
            <PartnerGrid title={t('footer.partners_international')} items={internationalPartners} />
            <PartnerGrid title={t('footer.partners_other')} items={otherPartners} />
          </div>
        )}
      </div>
    </main>
  );
}
