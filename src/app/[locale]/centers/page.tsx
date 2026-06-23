"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { InteractiveMap } from "@/components/interactive-map";
import { Building2, MapPin, ArrowRight } from "lucide-react";
import { useParams } from "next/navigation";

export default function CentersPage() {
  const params = useParams();
  const locale = params?.locale || "az";

  const clubs = [
    { name: "BDU Debat Klubu", slug: "bdu-debat-klubu", est: 2005 },
    { name: "UNEC Debat Klubu", slug: "unec-debat-klubu", est: 2008 },
    { name: "ADNSU Debat Klubu", slug: "adnsu-debat-klubu", est: 2010 },
    { name: "ADA Debat Klubu", slug: "ada-debat-klubu", est: 2012 },
    { name: "BQU Debat Klubu", slug: "bqu-debat-klubu", est: 2015 },
    { name: "SDU Debat Klubu", slug: "sdu-debat-klubu", est: 2014 },
  ];

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
            Əhatə Dairəmiz
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            DVC respublika üzrə fəaliyyət göstərən regional mərkəzlər və onlarla ali təhsil müəssisəsindəki debat klubları vasitəsilə minlərlə gənci ətrafında birləşdirir.
          </motion.p>
        </div>

        {/* University Clubs Section */}
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <Building2 className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold">Ali Təhsil Müəssisələrindəki Klublar</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club, idx) => (
              <motion.div
                key={club.slug}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link 
                  href={`/${locale}/centers/clubs/${club.slug}`}
                  className="block p-6 rounded-3xl bg-card border border-border hover:border-primary/50 shadow-sm hover:shadow-xl transition-all group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{club.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">Təsis ili: {club.est}</p>
                  <div className="flex items-center text-primary font-semibold text-sm group-hover:translate-x-1 transition-transform">
                    Ətraflı bax <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Regional Centers Section */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <MapPin className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold">Regional Mərkəzlər</h2>
          </div>
          <p className="text-muted-foreground mb-10">
            Xəritədəki regionların üzərinə klikləyərək həmin zonadakı regional mərkəzimiz haqqında ətraflı məlumat əldə edə bilərsiniz.
          </p>

          <div className="bg-card border border-border rounded-3xl p-4 md:p-8 shadow-sm">
            {/* We reuse the InteractiveMap component which has links/interactivity */}
            <InteractiveMap />
          </div>
        </div>

      </div>
    </div>
  );
}
