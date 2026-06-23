"use client";

import { motion } from "framer-motion";
import { Users, Folder, Video, Activity, TrendingUp, AlertCircle } from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    { label: "Ümumi İstifadəçi", value: "2,543", change: "+12%", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Aktiv Layihələr", value: "8", change: "+2", icon: Folder, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Canlı Otaqlar", value: "24", change: "+5", icon: Video, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Sistemin Yükü", value: "42%", change: "Normal", icon: Activity, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Statistika və Ümumi Baxış</h1>
          <p className="text-muted-foreground mt-1">Platformanın ümumi vəziyyətini buradan izləyə bilərsiniz.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="flex items-center gap-1 text-sm font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" /> {stat.change}
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
              <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Son Fəaliyyətlər</h3>
          <div className="space-y-6">
            {[
              { text: "Yeni istifadəçi qeydiyyatdan keçdi: Leyla Məmmədova", time: "5 dəqiqə əvvəl" },
              { text: "Milli Debat Forumu müraciəti təsdiqləndi: Rəşad Quliyev", time: "12 dəqiqə əvvəl" },
              { text: "Yeni sərbəst debat otağı yaradıldı", time: "45 dəqiqə əvvəl" },
              { text: "Sistem yenilənməsi tamamlandı", time: "2 saat əvvəl" },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{activity.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" /> Sistem Xəbərdarlıqları
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/5">
              <h4 className="font-bold text-orange-600 mb-1">Müraciət Sıxlığı</h4>
              <p className="text-sm text-orange-600/80">Youth INC proqramına son 1 saatda 50+ müraciət daxil olub. Təsdiq prosesi gecikə bilər.</p>
            </div>
            <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
              <h4 className="font-bold text-blue-600 mb-1">Yeni Versiya Mövcuddur</h4>
              <p className="text-sm text-blue-600/80">CMS-in 1.2 versiyası yoxlanışdadır.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
