"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Mail, Lock, User, Phone, MapPin, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";
import { MOCK_AUTH } from "@/lib/mock-auth";

const REGIONS = [
  "Bakı", "Sumqayıt", "Gəncə", "Mingəçevir", "Şirvan", "Lənkəran", "Şəki", "Quba", "Digər"
];

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    region: "Bakı",
    education: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      MOCK_AUTH.login(formData);
      router.push("/dashboard");
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      MOCK_AUTH.login({
        firstName: "Google",
        lastName: "User",
        email: "user@gmail.com",
        region: "Bakı"
      });
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-primary-neon/10 rounded-full blur-[128px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-card/80 backdrop-blur-xl border border-border shadow-2xl rounded-3xl p-8 md:p-12 relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">DVC-yə Qoşul</h1>
          <p className="text-muted-foreground">Sözün gücü ilə gələcəyini dəyişməyə başla.</p>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={isLoading}
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-border rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google ilə qeydiyyatdan keç
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-border flex-1" />
          <span className="text-sm text-muted-foreground font-medium">və ya e-poçtla</span>
          <div className="h-px bg-border flex-1" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ad</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                <input required type="text" className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" placeholder="Adınız" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Soyad</label>
              <input required type="text" className="w-full bg-background border border-border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" placeholder="Soyadınız" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">E-poçt</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
              <input required type="email" className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" placeholder="nümunə@gmail.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefon</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                <input required type="tel" className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" placeholder="+994 (00) 000-00-00" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Region</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                <select className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none transition-shadow" value={formData.region} onChange={(e) => setFormData({...formData, region: e.target.value})}>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Təhsil Müəssisəsi</label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
              <input type="text" className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" placeholder="Universitet / Məktəb" value={formData.education} onChange={(e) => setFormData({...formData, education: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Şifrə</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
              <input required type="password" minLength={6} className="w-full bg-background border border-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-hover text-white rounded-xl py-4 font-semibold transition-colors mt-6 flex items-center justify-center gap-2"
          >
            {isLoading ? "Yüklənir..." : "Qeydiyyatı Tamamla"} {!isLoading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-muted-foreground">
          Artıq hesabınız var? <Link href="/login" className="text-primary hover:underline font-semibold">Daxil olun</Link>
        </p>
      </motion.div>
    </div>
  );
}
