"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { logAdminAction } from "@/lib/audit-logger";

type Language = "az" | "en" | "ru";

interface PartnerItem {
  id: string;
  name_az: string; name_en: string; name_ru: string;
  category: "state" | "international" | "other";
  logo_url: string;
  website_url: string;
  order_index: number;
  created_at: string;
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>("az");
  
  // Form State
  const [formData, setFormData] = useState<Partial<PartnerItem>>({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .order("order_index", { ascending: true });
      
    if (data) {
      setPartners(data);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu tərəfdaşı silmək istədiyinizə əminsiniz?")) {
      const { error } = await supabase.from("partners").delete().eq("id", id);
      if (!error) {
        const deletedPartner = partners.find(p => p.id === id);
        setPartners(partners.filter(p => p.id !== id));
        await logAdminAction(`Tərəfdaş silindi: ${deletedPartner?.name_az || "Adsız"}`, "Partners");
      }
    }
  };

  const handleEdit = (item: PartnerItem) => {
    setFormData(item);
    setCurrentLang("az");
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setFormData({
      name_az: "", name_en: "", name_ru: "",
      category: "other",
      logo_url: "",
      website_url: "",
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
        .from("partners")
        .update(formData)
        .eq("id", formData.id)
        .select();
      if (error) {
        alert("Xəta: " + error.message);
        return;
      }
      if (data && data.length > 0) {
        setPartners(partners.map(p => p.id === formData.id ? data[0] : p));
        await logAdminAction(`Tərəfdaş yeniləndi: ${formData.name_az || "Adsız"}`, "Partners");
      }
    } else {
      // Insert
      const { data, error } = await supabase
        .from("partners")
        .insert([formData])
        .select();
      if (error) {
        alert("Xəta: " + error.message);
        return;
      }
      if (data && data.length > 0) {
        setPartners([...partners, data[0]]);
        await logAdminAction(`Yeni tərəfdaş əlavə edildi: ${formData.name_az || "Adsız"}`, "Partners");
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `partner_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("dvc_images")
      .upload(filePath, file);

    if (uploadError) {
      alert("Şəkil yüklənərkən xəta baş verdi: " + uploadError.message);
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage.from("dvc_images").getPublicUrl(filePath);
    if (data?.publicUrl) {
      setFormData(prev => ({ ...prev, logo_url: data.publicUrl }));
    }
    setIsUploading(false);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tərəfdaşlar (Partners)</h1>
          <p className="text-muted-foreground mt-1">Ana səhifə və tərəfdaşlar bölməsindəki qurumları idarə edin.</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Tərəfdaş</span>
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-black/5 dark:border-white/10">
                <th className="px-6 py-4 font-semibold text-sm">Loqo</th>
                <th className="px-6 py-4 font-semibold text-sm">Ad (AZ)</th>
                <th className="px-6 py-4 font-semibold text-sm">Kateqoriya</th>
                <th className="px-6 py-4 font-semibold text-sm">Veb-sayt</th>
                <th className="px-6 py-4 font-semibold text-sm">Sıra</th>
                <th className="px-6 py-4 font-semibold text-sm text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Yüklənir...</td>
                </tr>
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Heç bir tərəfdaş tapılmadı.</td>
                </tr>
              ) : (
                partners.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      {p.logo_url ? (
                        <div className="w-16 h-16 rounded-lg bg-white overflow-hidden border p-2 flex items-center justify-center">
                          <img src={p.logo_url} alt={p.name_az} className="max-w-full max-h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-muted-foreground opacity-50" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium">{p.name_az}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                        {p.category === 'state' ? 'Dövlət' : p.category === 'international' ? 'Beynəlxalq' : 'Korporativ/Yerli'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground truncate max-w-[150px]">
                      {p.website_url ? <a href={p.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary underline">{p.website_url}</a> : '-'}
                    </td>
                    <td className="px-6 py-4">{p.order_index}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(p)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors text-blue-600 dark:text-blue-400">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors text-red-600 dark:text-red-400">
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
              className="relative w-full max-w-3xl bg-card border border-black/5 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/10">
                <h2 className="text-xl font-bold">{formData.id ? 'Tərəfdaşı Redaktə Et' : 'Yeni Tərəfdaş'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex border-b border-black/5 dark:border-white/10 px-6 pt-4 gap-6 overflow-x-auto">
                <button
                  onClick={() => setCurrentLang("az")}
                  className={`pb-4 font-medium text-sm transition-colors relative whitespace-nowrap ${currentLang === "az" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Azərbaycanca
                  {currentLang === "az" && <motion.div layoutId="activeTabP" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                </button>
                <button
                  onClick={() => setCurrentLang("en")}
                  className={`pb-4 font-medium text-sm transition-colors relative whitespace-nowrap ${currentLang === "en" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  English
                  {currentLang === "en" && <motion.div layoutId="activeTabP" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                </button>
                <button
                  onClick={() => setCurrentLang("ru")}
                  className={`pb-4 font-medium text-sm transition-colors relative whitespace-nowrap ${currentLang === "ru" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Русский
                  {currentLang === "ru" && <motion.div layoutId="activeTabP" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <form id="partner-form" onSubmit={handleSave} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Kateqoriya</label>
                      <select
                        value={formData.category || 'other'}
                        onChange={(e) => handleGlobalChange("category", e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                      >
                        <option value="state">Dövlət Qurumları</option>
                        <option value="international">Beynəlxalq Tərəfdaşlar</option>
                        <option value="other">Korporativ / Yerli</option>
                      </select>
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Qurumun Adı</label>
                    <input
                      type="text"
                      value={(formData as any)[`name_${currentLang}`] || ""}
                      onChange={(e) => handleFieldChange("name", e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                      placeholder="Məsələn: Gənclər Fondu"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rəsmi Veb-sayt (URL)</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="url"
                        value={formData.website_url || ""}
                        onChange={(e) => handleGlobalChange("website_url", e.target.value)}
                        className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Loqo (Şəkil)</label>
                    <div className="flex items-center gap-4">
                      {formData.logo_url && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden border bg-white flex items-center justify-center shrink-0">
                          <img src={formData.logo_url} alt="Preview" className="max-w-full max-h-full object-contain p-2" />
                        </div>
                      )}
                      <div className="flex-1 relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-full bg-background border-2 border-dashed border-border rounded-xl px-4 py-6 flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors">
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                          <span className="text-sm font-medium text-center">
                            {isUploading ? "Yüklənir..." : "Şəkil seçmək üçün klikləyin və ya sürüşdürüb buraxın"}
                          </span>
                        </div>
                      </div>
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
                  form="partner-form"
                  disabled={isUploading}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium transition-colors disabled:opacity-50"
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
