"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, MapPin, Users, Calendar, Phone, Mail, Building2, User, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n-context";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/map-picker"), { ssr: false });

export default function RegionalCenterDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale as string || "az";
  const slug = params?.slug as string;
  const { t } = useTranslation();

  const [center, setCenter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchCenter();
    }
  }, [slug]);

  const fetchCenter = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("centers")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      console.error("Center not found:", error);
      router.push(`/${locale}/centers`);
    } else {
      setCenter(data);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-20 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!center) return null;

  const name = center[`name_${locale}`] || center.name_az;
  const description = center[`description_${locale}`] || center.description_az;
  const address = center[`address_${locale}`] || center.address_az;

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-semibold mb-8 text-muted-foreground">
          <Link href={`/${locale}`} className="hover:text-primary transition-colors">{t('navbar.home')}</Link>
          <span>&gt;</span>
          <Link href={`/${locale}/centers`} className="hover:text-primary transition-colors">{t('navbar.centers')}</Link>
          <span>&gt;</span>
          <span className="text-foreground">{name}</span>
        </div>

        {/* Back button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> {t('common.readMore') === "Ətraflı oxu" ? "Geri qayıt" : "Go back"}
        </button>

        {/* Header Section */}
        <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-sm mb-8 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-3xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 overflow-hidden">
            {center.image_url ? (
              <img src={center.image_url} alt={name} className="w-full h-full object-cover" />
            ) : (
              center.type === 'club' ? <Building2 className="w-16 h-16 text-primary" /> : <MapPin className="w-16 h-16 text-primary" />
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm font-bold text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                {locale === "az" ? "Təsis ili:" : "Est:"} {center.established_year}
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                {locale === "az" ? "Aktiv üzv:" : "Active members:"} {center.members_count}
              </div>
            </div>
            
            <Link 
              href={`/${locale}/register`}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" /> {locale === "az" ? "Mərkəzə Qoşul" : "Join Center"}
            </Link>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">{locale === "az" ? "Haqqında" : "About"}</h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {description || "Məlumat yoxdur."}
              </div>
            </div>

            {/* Map */}
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">{locale === "az" ? "Xəritədə tapın" : "Find on map"}</h2>
              <div className="h-[300px] rounded-2xl overflow-hidden border border-border pointer-events-none">
                <MapPicker 
                  lat={center.latitude || 40.4093} 
                  lng={center.longitude || 49.8671} 
                  onChange={() => {}} 
                />
              </div>
              <p className="mt-4 flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                {address}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Leadership */}
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-6">{locale === "az" ? "Mərkəz Rəhbərliyi" : "Center Leadership"}</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-bold">Rəhbər</h4>
                  <p className="text-xs text-muted-foreground">Mərkəz Rəhbəri</p>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-6">{locale === "az" ? "Əlaqə" : "Contact"}</h2>
              <div className="space-y-4">
                {center.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="font-semibold">{center.phone}</span>
                  </div>
                )}
                {center.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="font-semibold">{center.email}</span>
                  </div>
                )}
                {!center.phone && !center.email && (
                  <p className="text-sm text-muted-foreground">Əlaqə məlumatı yoxdur.</p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
