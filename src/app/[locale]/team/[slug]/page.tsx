"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, User, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-context";

export default function TeamMemberDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale as string || "az";
  const slug = params?.slug as string;
  const { t } = useTranslation();

  const [member, setMember] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchMember();
    }
  }, [slug]);

  const fetchMember = async () => {
    setIsLoading(true);
    // First try to fetch by slug, if not found try by ID just in case
    let { data, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      // Fallback to fetch by ID if slug is not found (for older entries without slug)
      const { data: idData, error: idError } = await supabase
        .from("team_members")
        .select("*")
        .eq("id", slug)
        .single();
        
      if (idError || !idData) {
        console.error("Member not found:", idError);
        router.push(`/${locale}/about`);
        return;
      }
      data = idData;
    }
    
    setMember(data);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-20 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!member) return null;

  const role = member[`role_${locale}`] || member.role_az;
  const bio = member[`bio_${locale}`] || member.bio_az;

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-semibold mb-8 text-muted-foreground">
          <Link href={`/${locale}`} className="hover:text-primary transition-colors">{t('navbar.home')}</Link>
          <span>&gt;</span>
          <Link href={`/${locale}/about`} className="hover:text-primary transition-colors">{t('navbar.about')}</Link>
          <span>&gt;</span>
          <span className="text-foreground">{member.name}</span>
        </div>

        {/* Back button */}
        <button 
          onClick={() => router.push(`/${locale}/about`)}
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> {locale === "az" ? "Geri qayıt" : "Go back"}
        </button>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-sm mb-8 flex flex-col md:flex-row gap-8 md:gap-12 relative overflow-hidden">
          
          {/* Left: Image */}
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-3xl shrink-0 overflow-hidden shadow-xl border border-border/50 mx-auto md:mx-0">
            {member.image_url ? (
              <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                <User className="w-20 h-20 text-primary" />
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="flex-1 flex flex-col justify-center text-center md:text-left z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-foreground">{member.name}</h1>
            <p className="text-xl md:text-2xl font-semibold text-primary mb-6">{role}</p>
            
            <div className="flex items-center justify-center md:justify-start gap-4 mt-auto">
              {member.linkedin_url && (
                <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 transition-colors border border-blue-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
              )}
              {member.instagram_url && (
                <a href={member.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 rounded-2xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 transition-colors border border-pink-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
              )}
              {member.facebook_url && (
                <a href={member.facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 transition-colors border border-blue-600/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
              {member.mail_address && (
                <a href={`mailto:${member.mail_address}`} className="flex items-center justify-center w-12 h-12 rounded-2xl bg-muted hover:bg-muted-hover text-foreground transition-colors border border-border">
                  <Mail className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {bio && (
          <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              {locale === "az" ? "Haqqında" : "About"}
            </h2>
            <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-lg font-medium">
              {bio}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
