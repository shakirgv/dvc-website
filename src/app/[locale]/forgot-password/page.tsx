"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setIsSent(true);
      setTimeout(() => setIsSent(false), 5000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-primary-neon/10 rounded-full blur-[128px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-border shadow-2xl rounded-3xl p-8 md:p-10 relative z-10"
      >
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Geri qayıt
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Şifrəni Unutmusan?</h1>
          <p className="text-muted-foreground">Narahat olmayın. E-poçt ünvanınızı daxil edin və şifrəni sıfırlamaq üçün link göndərək.</p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-6 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative">
          <div className="space-y-2">
            <label className="text-sm font-medium">E-poçt ünvanı</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
              <input 
                required 
                type="email" 
                className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" 
                placeholder="nümunə@gmail.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || isSent}
            className={`w-full text-white rounded-xl py-4 font-semibold transition-all mt-6 flex items-center justify-center gap-2 ${
              isSent ? "bg-green-500 hover:bg-green-600" : "bg-primary hover:bg-primary-hover"
            }`}
          >
            {isLoading ? "Göndərilir..." : isSent ? "Göndərildi!" : "Sıfırlama Linki Göndər"}
          </button>
        </form>
      </motion.div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {isSent && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-card border border-green-500/20 shadow-2xl shadow-green-500/10 rounded-2xl p-4 flex items-center gap-4 z-50 min-w-[300px]"
          >
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h4 className="font-bold text-foreground text-sm">Uğurla göndərildi!</h4>
              <p className="text-muted-foreground text-xs">E-poçt qutunuzu (və Spam bölməsini) yoxlayın.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
