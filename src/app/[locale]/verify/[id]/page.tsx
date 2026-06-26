"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, XCircle, Award, Calendar, User, Hash, ShieldCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function VerifyCertificatePage() {
  const params = useParams();
  const certId = params.id as string;
  const [isValidating, setIsValidating] = useState(true);
  const [certData, setCertData] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    if (certId) {
      validateCertificate();
    }
  }, [certId]);

  const validateCertificate = async () => {
    setIsValidating(true);
    const { data, error } = await supabase
      .from("certificates")
      .select("*, profiles(first_name, last_name, dvc_id)")
      .eq("cert_id", certId)
      .single();

    if (data && !error) {
      setCertData(data);
    } else {
      setCertData(null);
    }
    setIsValidating(false);
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md z-10">
        
        <div className="text-center mb-8">
          <Link href="/az" className="inline-block">
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <span className="bg-primary text-white p-1.5 rounded-xl">DVC</span>
            </h1>
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border shadow-xl rounded-3xl p-8 relative overflow-hidden"
        >
          {isValidating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground font-medium animate-pulse">Sertifikat yoxlanılır...</p>
            </div>
          ) : certData ? (
            // SUCCESS STATE
            <div className="text-center">
              <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-20" />
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              
              <h2 className="text-2xl font-bold mb-3 text-green-500 flex items-center justify-center gap-2">
                <ShieldCheck className="w-6 h-6" /> Sertifikat Təsdiqləndi
              </h2>
              
              <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                Bu sertifikat rəsmi olaraq Vətəndaş Cəmiyyətində Debat İctimai Birliyi (DVC) tərəfindən verilmişdir və qüvvədədir.
              </p>

              <div className="bg-muted/30 border border-border rounded-2xl p-5 text-left space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Hash className="w-4 h-4" /> Sertifikat ID:
                  </div>
                  <div className="font-bold font-mono text-sm">{certData.cert_id}</div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <User className="w-4 h-4" /> İştirakçı:
                  </div>
                  <div className="font-bold text-sm text-right">
                    {certData.profiles?.first_name} {certData.profiles?.last_name} ({certData.profiles?.dvc_id})
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-border/50">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Calendar className="w-4 h-4" /> Proqram:
                  </div>
                  <div className="font-bold text-sm text-right">{certData.program_name}</div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Award className="w-4 h-4" /> Status:
                  </div>
                  <div className="font-bold text-green-500 text-sm">Aktiv / Verified</div>
                </div>

              </div>

              <div className="mt-8">
                <a href={certData.pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-colors shadow-md w-full justify-center">
                  Orijinal PDF-ə Bax
                </a>
              </div>
            </div>
          ) : (
            // ERROR STATE
            <div className="text-center py-6">
              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              
              <h2 className="text-2xl font-bold mb-3 text-red-500">
                Sertifikat Tapılmadı
              </h2>
              
              <p className="text-muted-foreground mb-8">
                Axtardığınız ID-yə ({certId}) uyğun sertifikat sistemdə tapılmadı. Bu sertifikat etibarsız ola bilər və ya ID səhv daxil edilib.
              </p>

              <Link href="/az" className="inline-flex items-center justify-center px-6 py-3 bg-muted font-bold text-foreground rounded-xl w-full hover:bg-muted/80 transition-colors">
                Ana Səhifəyə Qayıt
              </Link>
            </div>
          )}
        </motion.div>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Vətəndaş Cəmiyyətində Debat İctimai Birliyi
        </div>
      </div>
    </div>
  );
}
