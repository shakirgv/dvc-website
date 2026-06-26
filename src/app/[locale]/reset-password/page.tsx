"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { PasswordInput } from "@/components/ui/password-input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Şifrələr uyğun gəlmir.");
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Şifrə minimum 6 simvol olmalıdır.");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-primary-neon/10 rounded-full blur-[128px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-border shadow-2xl rounded-3xl p-8 md:p-10 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Yeni Şifrə Təyin Edin</h1>
          <p className="text-muted-foreground">Zəhmət olmasa yeni şifrənizi daxil edin.</p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-6 text-center">
            {errorMsg}
          </div>
        )}

        {isSuccess ? (
          <div className="text-center space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 p-6 rounded-2xl">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h3 className="text-xl font-bold mb-2">Uğurlu!</h3>
              <p>Şifrəniz müvəffəqiyyətlə dəyişdirildi. Giriş səhifəsinə yönləndirilirsiniz...</p>
            </div>
            <Link href="/login" className="text-primary hover:underline font-semibold block mt-4">
              Daxil ol səhifəsinə qayıt
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Yeni Şifrə</label>
              <PasswordInput 
                required 
                minLength={6}
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                icon={<Lock className="w-5 h-5" />}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Şifrə Təkrarı</label>
              <PasswordInput 
                required 
                minLength={6}
                placeholder="••••••••" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                icon={<Lock className="w-5 h-5" />}
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full text-white rounded-xl py-4 font-semibold transition-all mt-6 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover"
            >
              {isLoading ? "Yenilənir..." : "Şifrəni Yenilə"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
