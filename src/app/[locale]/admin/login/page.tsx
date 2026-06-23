"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ShieldCheck, Lock, Mail, ArrowRight, Home } from "lucide-react";
import { MOCK_AUTH } from "@/lib/mock-auth";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "az";
  
  const [email, setEmail] = useState("admin@dvc.az");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email === "admin@dvc.az" && password === "admin123") {
      MOCK_AUTH.login({ email, password });
      router.push(`/${locale}/admin`);
    } else {
      setError("İstifadəçi adı və ya şifrə yanlışdır. (İpucu: admin@dvc.az / admin123)");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden px-4">
      {/* Premium Dark Mode Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-primary-neon/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0,transparent_100%)] pointer-events-none" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-gray-900/50 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 relative z-10 shadow-2xl"
      >
        <Link href={`/${locale}`} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
          <Home className="w-5 h-5" />
        </Link>
        
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 border border-primary/50 shadow-[0_0_30px_rgba(var(--primary),0.3)]">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">DVC İdarəetmə Paneli</h1>
          <p className="text-gray-400 text-sm mt-2">Sistemə daxil olmaq üçün məlumatlarınızı qeyd edin</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">E-poçt Ünvanı</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="email" 
                required
                className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Şifrə</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="password" 
                required
                className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-white text-black font-bold rounded-xl py-4 hover:bg-gray-200 transition-colors mt-4 flex items-center justify-center gap-2 group"
          >
            Sistemə Daxil Ol <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-gray-500">DVC Platforması • Bütün hüquqlar qorunur 2026</p>
        </div>
      </motion.div>
    </div>
  );
}
