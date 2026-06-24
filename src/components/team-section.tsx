"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n-context";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { Link as LinkIcon, Mail } from "lucide-react";

export function TeamSection() {
  const { t } = useTranslation();
  const params = useParams();
  const locale = (params?.locale as string) || "az";
  const [team, setTeam] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      const { data } = await supabase
        .from("team_members")
        .select("*")
        .eq("status", "Active")
        .order("order_index", { ascending: true });
      if (data) setTeam(data);
      setIsLoading(false);
    };
    fetchTeam();
  }, []);

  return (
    <section className="relative py-24 md:py-32 bg-muted/30 border-y border-black/5 dark:border-white/5 overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            {t("team.badge") || "İdarə Heyəti"}
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold mb-6 text-foreground tracking-tight"
          >
            {t("team.title") || "Komandamız"}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mb-8"
          >
            {t("team.subtitle") || "DVC-nin uğur hekayəsinin arxasında dayanan peşəkar və əzmli idarə heyəti ilə tanış olun."}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {isLoading ? (
            [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-card/50 backdrop-blur-sm rounded-3xl border border-white/10 aspect-[3/4] animate-pulse"></div>
            ))
          ) : team.length > 0 ? (
            team.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative rounded-3xl overflow-hidden aspect-[3/4] bg-card border border-white/10 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2"
              >
                <img 
                  src={member.image_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop"} 
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-left translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                  <p className="text-primary-neon font-semibold text-sm mb-3 uppercase tracking-wider">{member[`role_${locale}`]}</p>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    <p className="text-white/80 text-sm line-clamp-3 mb-4">
                      {member[`bio_${locale}`]}
                    </p>
                    <div className="flex items-center gap-2">
                      {member.linkedin_url && (
                        <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors border border-white/20 hover:-translate-y-1">
                          <LinkIcon className="w-4 h-4" />
                        </a>
                      )}
                      {member.instagram_url && (
                        <a href={member.instagram_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors border border-white/20 hover:-translate-y-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                        </a>
                      )}
                      {member.facebook_url && (
                        <a href={member.facebook_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors border border-white/20 hover:-translate-y-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                        </a>
                      )}
                      {member.mail_address && (
                        <a href={`mailto:${member.mail_address}`} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors border border-white/20 hover:-translate-y-1">
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-10">
              Komanda üzvləri tezliklə əlavə olunacaq.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
