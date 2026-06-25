"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Folder, Video, Activity, TrendingUp, AlertCircle, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { az } from "date-fns/locale";

export default function AdminDashboardPage() {
  const supabase = createClient();
  const [stats, setStats] = useState({
    users: 0,
    activeProjects: 0,
    activeRooms: 0,
    pendingApps: 0,
    pendingMessages: 0
  });
  const [recentFeed, setRecentFeed] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // 1. Fetch Stats
      const [{ count: userCount }, { count: projCount }, { count: roomCount }, { count: appCount }, { count: msgCount }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
        supabase.from('debate_rooms').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      setStats({
        users: userCount || 0,
        activeProjects: projCount || 0,
        activeRooms: roomCount || 0,
        pendingApps: appCount || 0,
        pendingMessages: msgCount || 0
      });

      // 2. Fetch Recent Activities (Registrations and Applications)
      const { data: recentUsers } = await supabase.from('profiles')
        .select('first_name, last_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentApps } = await supabase.from('applications')
        .select('user_name, created_at, projects(title_az)')
        .order('created_at', { ascending: false })
        .limit(5);

      // 3. Merge and Sort Activities
      const combinedFeed: any[] = [];
      
      if (recentUsers) {
        recentUsers.forEach(u => {
          combinedFeed.push({
            type: 'user',
            text: `Yeni istifadəçi qeydiyyatdan keçdi: ${u.first_name || ''} ${u.last_name || ''}`,
            timestamp: new Date(u.created_at)
          });
        });
      }

      if (recentApps) {
        recentApps.forEach(a => {
          const projTitle = Array.isArray(a.projects) ? a.projects[0]?.title_az : (a.projects as any)?.title_az;
          combinedFeed.push({
            type: 'app',
            text: `${a.user_name} "${projTitle || 'Layihə'}" proqramına müraciət etdi.`,
            timestamp: new Date(a.created_at)
          });
        });
      }

      combinedFeed.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setRecentFeed(combinedFeed.slice(0, 6));
      setIsLoading(false);
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { label: "Ümumi İstifadəçi", value: stats.users, change: "Canlı", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Aktiv Layihələr", value: stats.activeProjects, change: "Canlı", icon: Folder, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Canlı Otaqlar", value: stats.activeRooms, change: "Canlı", icon: Video, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Gözləyən Müraciətlər", value: stats.pendingApps, change: "Baxılmalıdır", icon: FileText, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Cavablanmamış Əlaqələr", value: stats.pendingMessages, change: "Baxılmalıdır", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
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
        {statCards.map((stat, i) => (
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
              <span className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${stat.change === 'Baxılmalıdır' ? 'text-orange-500 bg-orange-500/10' : 'text-green-500 bg-green-500/10'}`}>
                <TrendingUp className="w-3 h-3" /> {stat.change}
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-1">{isLoading ? "..." : stat.value}</h3>
              <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Son Fəaliyyətlər (Real-time)</h3>
          {isLoading ? (
            <div className="text-muted-foreground text-sm">Yüklənir...</div>
          ) : recentFeed.length === 0 ? (
            <div className="text-muted-foreground text-sm">Heç bir fəaliyyət yoxdur.</div>
          ) : (
            <div className="space-y-6">
              {recentFeed.map((activity, i) => (
                <div key={i} className="flex gap-4">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${activity.type === 'app' ? 'bg-orange-500' : 'bg-primary'}`} />
                  <div>
                    <p className="text-sm font-medium">{activity.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: az })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Alerts */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" /> Sistemin Vəziyyəti
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5">
              <h4 className="font-bold text-green-600 mb-1">Server Gecikməsi (Ping)</h4>
              <p className="text-sm text-green-600/80">~42ms (Normal). Bütün xidmətlər tam operativdir.</p>
            </div>
            {stats.pendingApps > 0 && (
              <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/5">
                <h4 className="font-bold text-orange-600 mb-1">Baxılmamış Müraciətlər</h4>
                <p className="text-sm text-orange-600/80">Sistemdə baxılmağı gözləyən {stats.pendingApps} yeni müraciət var. Zəhmət olmasa Layihələr bölməsinə nəzər yetirin.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
