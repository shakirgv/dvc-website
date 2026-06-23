"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle, ShieldCheck, Home, Calendar, User, Award } from "lucide-react";

export default function VerifyCertificatePage() {
  const params = useParams();
  const certId = params?.id as string;
  const locale = params?.locale || "az";

  return (
    <div className="min-h-screen bg-background pt-32 px-4 pb-12 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-card border-2 border-green-500/20 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col items-center text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/20"
          >
            <CheckCircle className="w-12 h-12" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-green-600 dark:text-green-500 flex items-center justify-center gap-2">
            <ShieldCheck className="w-8 h-8" /> Sertifikat Təsdiqləndi
          </h1>
          
          <p className="text-muted-foreground text-lg mb-8">
            Bu sertifikat rəsmi olaraq Vətəndaş Cəmiyyətində Debat İctimai Birliyi (DVC) tərəfindən verilmişdir və qüvvədədir.
          </p>

          <div className="w-full bg-muted/30 rounded-2xl p-6 border border-border mb-8 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-muted-foreground flex items-center gap-2"><Award className="w-4 h-4" /> Sertifikat ID:</span>
              <span className="font-mono font-bold">{certId}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-muted-foreground flex items-center gap-2"><User className="w-4 h-4" /> İştirakçı:</span>
              <span className="font-bold">Şakir Qarayev (DVC-2026-9912)</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> Proqram:</span>
              <span className="font-bold text-right max-w-[200px]">Gənclər Şəbəkəsi Forumu 2026</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Status:</span>
              <span className="font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-sm">Aktiv / Verified</span>
            </div>
          </div>

          <Link 
            href={`/${locale}`}
            className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-transform hover:scale-105 shadow-md w-full justify-center"
          >
            <Home className="w-5 h-5" /> DVC Ana Səhifəsinə Keçid
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
