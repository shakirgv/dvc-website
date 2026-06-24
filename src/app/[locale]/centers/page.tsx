"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { InteractiveMap } from "@/components/interactive-map";
import { Building2, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-context";
import { useState, useEffect } from "react";

export default function CentersPage() {
  const params = useParams();
  const locale = params?.locale || "az";

  const { t } = useTranslation();
  const [centers, setCenters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCenters() {
      setIsLoading(true);
      const { data } = await supabase.from("centers").select("*");
      if (data) {
        setCenters(data);
      }
      setIsLoading(false);
    }
    loadCenters();
  }, []);

  const clubs = centers.filter(c => c.type === 'club');
  const regionals = centers.filter(c => c.type === 'regional');

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            {t('navbar.centers')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            {locale === "az" ? "DVC respublika üzrə fəaliyyət göstərən regional mərkəzlər və onlarla ali təhsil müəssisəsindəki debat klubları vasitəsilə minlərlə gənci ətrafında birləşdirir." : "DVC unites thousands of young people through regional centers and debate clubs in higher education institutions."}
          </motion.p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* University Clubs Section */}
            <div className="mb-24">
              <div className="flex items-center gap-3 mb-8">
                <Building2 className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-bold">{locale === "az" ? "Ali Təhsil Müəssisələrindəki Klublar" : "Clubs in Higher Education Institutions"}</h2>
              </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {clubs.map((club, idx) => {
                const name = club[`name_${locale}`] || club.name_az || "";
                return (
                  <motion.div
                    key={club.slug || club.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link 
                      href={`/${locale}/centers/clubs/${club.slug || club.id}`}
                      className="block p-6 rounded-3xl bg-card border border-border hover:border-primary/50 shadow-sm hover:shadow-xl transition-all group"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform overflow-hidden">
                        {club.image_url ? (
                          <img src={club.image_url} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-8 h-8 text-primary" />
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{locale === "az" ? "Təsis ili:" : "Est:"} {club.established_year}</p>
                      <div className="flex items-center text-primary font-semibold text-sm group-hover:translate-x-1 transition-transform">
                        {t('common.readMore')} <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
              {clubs.length === 0 && (
                <div className="col-span-3 text-muted-foreground text-center py-10">
                  {locale === "az" ? "Klub məlumatları tapılmadı." : "No club data found."}
                </div>
              )}
            </div>
          </div>

        {/* Regional Centers Section */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <MapPin className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold">{locale === "az" ? "Regional Mərkəzlər" : "Regional Centers"}</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {regionals.map((center, idx) => {
                const name = center[`name_${locale}`] || center.name_az || "";
                return (
                  <motion.div
                    key={center.slug || center.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link 
                      href={`/${locale}/centers/regional/${center.slug || center.id}`}
                      className="block p-6 rounded-3xl bg-card border border-border hover:border-primary/50 shadow-sm hover:shadow-xl transition-all group"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform overflow-hidden">
                        {center.image_url ? (
                          <img src={center.image_url} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <MapPin className="w-8 h-8 text-primary" />
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 truncate">{center[`address_${locale}`] || center.address_az}</p>
                      <div className="flex items-center text-primary font-semibold text-sm group-hover:translate-x-1 transition-transform">
                        {t('common.readMore')} <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
          </div>

          <p className="text-muted-foreground mb-10 text-center">
            {locale === "az" ? "Xəritədəki regionların üzərinə klikləyərək həmin zonadakı regional mərkəzimiz haqqında ətraflı məlumat əldə edə bilərsiniz." : "Click on the map regions to learn more about our regional centers."}
          </p>

          <div className="bg-card border border-border rounded-3xl p-4 md:p-8 shadow-sm">
            <InteractiveMap />
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
