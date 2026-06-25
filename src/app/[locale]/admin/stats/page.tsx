"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, BarChart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { logAdminAction } from "@/lib/audit-logger";

type Language = "az" | "en" | "ru";

interface StatItem {
  id: string;
  stat_value: string;
  label_az: string; 
  label_en: string; 
  label_ru: string;
  order_index: number;
  created_at: string;
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>("az");
  
  // Form State
  const [formData, setFormData] = useState<Partial<StatItem>>({});

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("home_stats")
      .select("*")
      .order("order_index", { ascending: true });
      
    if (data) {
      setStats(data);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu statistikanı silmək istədiyinizə əminsiniz?")) {
      const { error } = await supabase.from("home_stats").delete().eq("id", id);
      if (!error) {
        const deletedStat = stats.find(s => s.id === id);
        setStats(stats.filter(s => s.id !== id));
        await logAdminAction(`Statistika silindi: ${deletedStat?.label_az || "Adsız"}`, "Stats");
      }
    }
  };

  const handleEdit = (item: StatItem) => {
    setFormData(item);
    setCurrentLang("az");
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setFormData({
      stat_value: "",
      label_az: "", label_en: "", label_ru: "",
      order_index: 0,
      created_at: new Date().toISOString()
    });
    setCurrentLang("az");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      // Update
      const { data, error } = await supabase
        .from("home_stats")
        .update(formData)
        .eq("id", formData.id)
        .select();
      if (error) {
        alert("Xəta: " + error.message);
        return;
      }
      if (data && data.length > 0) {
        setStats(stats.map(s => s.id === formData.id ? data[0] : s));
        await logAdminAction(`Statistika yeniləndi: ${formData.label_az || "Adsız"}`, "Stats");
      }
    } else {
      // Insert
      const { data, error } = await supabase
        .from("home_stats")
        .insert([formData])
        .select();
      if (error) {
        alert("Xəta: " + error.message);
        return;
      }
      if (data && data.length > 0) {
        setStats([...stats, data[0]]);
        await logAdminAction(`Yeni statistika əlavə edildi: ${formData.label_az || "Adsız"}`, "Stats");
      }
    }
    setIsModalOpen(false);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [`${field}_${currentLang}`]: value }));
  };

  const handleGlobalChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart className="w-8 h-8 text-primary" />
            Statistika
          </h1>
          <p className="text-muted-foreground mt-1">Ana səhifədə yer alan statistik göstəriciləri (sayğacları) idarə edin.</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Statistika</span>
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-black/5 dark:border-white/10">
                <th className="px-6 py-4 font-semibold text-sm">Dəyər</th>
                <th className="px-6 py-4 font-semibold text-sm">Ad (AZ)</th>
                <th className="px-6 py-4 font-semibold text-sm">Sıra</th>
                <th className="px-6 py-4 font-semibold text-sm text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Yüklənir...</td>
                </tr>
              ) : stats.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Heç bir statistika tapılmadı.</td>
                </tr>
              ) : (
                stats.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-xl">{s.stat_value}</td>
                    <td className="px-6 py-4 font-medium text-muted-foreground">{s.label_az}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-muted rounded-lg text-sm">{s.order_index}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(s)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors text-blue-600 dark:text-blue-400">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors text-red-600 dark:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-card border border-black/5 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/10">
                <h2 className="text-xl font-bold">{formData.id ? 'Statistikanı Redaktə Et' : 'Yeni Statistika'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <form id="stat-form" onSubmit={handleSave} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sayğac Dəyəri (Məs: 45+)</label>
                      <input
                        type="text"
                        value={formData.stat_value || ""}
                        onChange={(e) => handleGlobalChange("stat_value", e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                        placeholder="Məsələn: 10K+"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sıralama İndeksi (0 ən öndə)</label>
                      <input
                        type="number"
                        value={formData.order_index || 0}
                        onChange={(e) => handleGlobalChange("order_index", parseInt(e.target.value))}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>

                  {/* Tabs for Labels */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <label className="text-sm font-medium block">Statistikanın Adı</label>
                    <div className="flex border-b border-black/5 dark:border-white/10 gap-6">
                      <button
                        type="button"
                        onClick={() => setCurrentLang("az")}
                        className={`pb-3 font-medium text-sm transition-colors relative whitespace-nowrap ${currentLang === "az" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        Azərbaycanca
                        {currentLang === "az" && <motion.div layoutId="activeTabS" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentLang("en")}
                        className={`pb-3 font-medium text-sm transition-colors relative whitespace-nowrap ${currentLang === "en" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        English
                        {currentLang === "en" && <motion.div layoutId="activeTabS" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentLang("ru")}
                        className={`pb-3 font-medium text-sm transition-colors relative whitespace-nowrap ${currentLang === "ru" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        Русский
                        {currentLang === "ru" && <motion.div layoutId="activeTabS" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                      </button>
                    </div>

                    <div className="space-y-2 pt-2">
                      <input
                        type="text"
                        value={(formData as any)[`label_${currentLang}`] || ""}
                        onChange={(e) => handleFieldChange("label", e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                        placeholder={currentLang === "az" ? "Məsələn: Aktiv Klub" : currentLang === "en" ? "Example: Active Clubs" : "Пример: Активные клубы"}
                      />
                    </div>
                  </div>

                </form>
              </div>

              <div className="p-6 border-t border-black/5 dark:border-white/10 flex justify-end gap-4 bg-muted/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-medium hover:bg-muted transition-colors"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  form="stat-form"
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium transition-colors"
                >
                  Yadda saxla
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
