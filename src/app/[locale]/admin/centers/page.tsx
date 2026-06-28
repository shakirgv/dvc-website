"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Globe, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { logAdminAction } from "@/lib/audit-logger";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/map-picker"), { ssr: false });

type Language = "az" | "en" | "ru";

interface CenterItem {
  id: string;
  type: string;
  slug: string;
  name_az: string; name_en: string; name_ru: string;
  address_az: string; address_en: string; address_ru: string;
  description_az: string; description_en: string; description_ru: string;
  established_year: string;
  members_count: string;
  phone: string;
  email: string;
  image_url: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export default function AdminCentersPage() {
  const [centers, setCenters] = useState<CenterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>("az");
  
  // Form State
  const [formData, setFormData] = useState<Partial<CenterItem>>({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("centers")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (data) {
      setCenters(data);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu mərkəzi/klubu silmək istədiyinizə əminsiniz?")) {
      const { error } = await supabase.from("centers").delete().eq("id", id);
      if (!error) {
        const deletedCenter = centers.find(c => c.id === id);
        setCenters(centers.filter(c => c.id !== id));
        await logAdminAction(`Mərkəz/Klub silindi: ${deletedCenter?.name_az || "Adsız"}`, "Centers");
      }
    }
  };

  const handleEdit = (item: CenterItem) => {
    setFormData(item);
    setCurrentLang("az");
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setFormData({
      type: "club",
      slug: "",
      name_az: "", name_en: "", name_ru: "",
      address_az: "", address_en: "", address_ru: "",
      description_az: "", description_en: "", description_ru: "",
      established_year: "",
      members_count: "",
      phone: "",
      email: "",
      image_url: "",
      latitude: 40.1431,
      longitude: 47.5769,
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
        .from("centers")
        .update(formData)
        .eq("id", formData.id)
        .select();
      if (error) {
        alert("Xəta: " + error.message);
        return;
      }
      if (data && data.length > 0) {
        setCenters(centers.map(c => c.id === formData.id ? data[0] : c));
        await logAdminAction(`Mərkəz/Klub yeniləndi: ${formData.name_az || "Adsız"}`, "Centers");
      }
    } else {
      // Insert
      const { data, error } = await supabase
        .from("centers")
        .insert([formData])
        .select();
      if (error) {
        alert("Xəta: " + error.message);
        return;
      }
      if (data && data.length > 0) {
        setCenters([data[0], ...centers]);
        await logAdminAction(`Yeni Mərkəz/Klub yaradıldı: ${formData.name_az || "Adsız"}`, "Centers");
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
    const fileName = `${Date.now()}.${fileExt}`;
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
      setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
    }
    setIsUploading(false);
  };

  const generateSlug = () => {
    if (!formData.name_az) {
      alert("Zəhmət olmasa əvvəlcə Mərkəz/Klub adını (AZ) daxil edin.");
      return;
    }
    const charMap: { [key: string]: string } = {
      'ç': 'c', 'ş': 's', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ü': 'u', 'ə': 'e',
      'Ç': 'c', 'Ş': 's', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ü': 'u', 'Ə': 'e'
    };
    let text = formData.name_az.replace(/[çşğıöüəÇŞĞİÖÜƏ]/g, match => charMap[match] || match);
    text = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim();
    const slug = text.replace(/[\s-]+/g, '-');
    handleGlobalChange("slug", slug);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mərkəzlər və Klublar</h1>
          <p className="text-muted-foreground mt-1">Sistemdəki bütün DVC Regional Mərkəzləri və Debat Klublarının idarəolunması.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-hover transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Yeni Əlavə Et
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm min-h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">Yüklənir...</div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Adı (AZ)</th>
                <th className="px-6 py-4 font-medium">Tipi</th>
                <th className="px-6 py-4 font-medium">Slug</th>
                <th className="px-6 py-4 font-medium text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {centers.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-medium">{item.name_az || "Adı yoxdur"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                      item.type === "club" ? "bg-blue-500/10 text-blue-600" : "bg-purple-500/10 text-purple-600"
                    }`}>
                      {item.type === "club" ? "Klub" : "Regional Mərkəz"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-muted-foreground">{item.slug}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {centers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    Heç bir məlumat tapılmadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE/EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl bg-card border border-border rounded-3xl shadow-2xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-2xl font-bold mb-6">{formData.id ? "Məlumatı Redaktə Et" : "Yeni Mərkəz/Klub Yarat"}</h3>
              
              <form onSubmit={handleSave} className="space-y-6">
                
                {/* GLOBAL SETTINGS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-2xl border border-border">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-muted-foreground uppercase">Tipi</label>
                    <select 
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={formData.type || "club"}
                      onChange={e => handleGlobalChange("type", e.target.value)}
                    >
                      <option value="club">Debat Klubu</option>
                      <option value="regional">Regional Mərkəz</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-muted-foreground uppercase flex items-center justify-between">
                      URL Slug (Unikal)
                      <button 
                        type="button" 
                        onClick={generateSlug}
                        className="text-primary hover:bg-primary/10 p-1 rounded-md transition-colors"
                        title="Avtomatik Yarat"
                      >
                        <Wand2 className="w-4 h-4" />
                      </button>
                    </label>
                    <input 
                      required
                      type="text" 
                      placeholder="meselen: asoiu-debat"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                      value={formData.slug || ""}
                      onChange={e => handleGlobalChange("slug", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase flex items-center justify-between">
                      <span>Loqo / Şəkil</span>
                      {isUploading && <span className="text-xs text-primary animate-pulse">Yüklənir...</span>}
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="https://..."
                        className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={formData.image_url || ""}
                        onChange={e => handleGlobalChange("image_url", e.target.value)}
                      />
                      <label className="flex items-center justify-center px-4 py-2 bg-muted border border-border rounded-xl cursor-pointer hover:bg-muted/80 transition-colors shrink-0">
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleImageUpload}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-muted-foreground uppercase">Yaranma İli</label>
                    <input 
                      type="text" 
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={formData.established_year || ""}
                      onChange={e => handleGlobalChange("established_year", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-muted-foreground uppercase">Üzv Sayı</label>
                    <input 
                      type="text" 
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={formData.members_count || ""}
                      onChange={e => handleGlobalChange("members_count", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-muted-foreground uppercase">Telefon</label>
                    <input 
                      type="text" 
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={formData.phone || ""}
                      onChange={e => handleGlobalChange("phone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-muted-foreground uppercase">E-poçt</label>
                    <input 
                      type="email" 
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={formData.email || ""}
                      onChange={e => handleGlobalChange("email", e.target.value)}
                    />
                  </div>
                </div>

                {/* Xəritə Koordinatları */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase">Xəritə Koordinatları</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Enlik (Latitude)</label>
                      <input 
                        type="number" 
                        step="any"
                        className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={formData.latitude || ""}
                        onChange={e => handleGlobalChange("latitude", parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Uzunluq (Longitude)</label>
                      <input 
                        type="number" 
                        step="any"
                        className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={formData.longitude || ""}
                        onChange={e => handleGlobalChange("longitude", parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-2">Mərkəzin yerləşdiyi konumu dəqiqləşdirmək üçün xəritə üzərində klikləyə bilərsiniz.</p>
                    <MapPicker 
                      lat={formData.latitude || 40.1431} 
                      lng={formData.longitude || 47.5769} 
                      onChange={(lat, lng) => {
                        handleGlobalChange("latitude", lat);
                        handleGlobalChange("longitude", lng);
                      }} 
                    />
                  </div>
                </div>

                {/* LANGUAGE TABS */}
                <div className="border-b border-border flex gap-4">
                  {(["az", "en", "ru"] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setCurrentLang(lang)}
                      className={`pb-3 px-4 font-bold text-sm uppercase transition-colors relative ${
                        currentLang === lang ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Globe className="w-4 h-4 inline-block mr-2 -mt-1" />
                      {lang === "az" ? "Azərbaycan" : lang === "en" ? "İngilis" : "Rus"}
                      {currentLang === lang && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                      )}
                    </button>
                  ))}
                </div>

                {/* MULTI-LANGUAGE FIELDS */}
                <motion.div
                  key={currentLang}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-muted-foreground uppercase">Mərkəzin / Klubun Adı ({currentLang.toUpperCase()})</label>
                    <input 
                      required={currentLang === "az"} 
                      type="text" 
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={(formData as any)[`name_${currentLang}`] || ""}
                      onChange={e => handleFieldChange("name", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-muted-foreground uppercase">Ünvan ({currentLang.toUpperCase()})</label>
                    <input 
                      type="text" 
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={(formData as any)[`address_${currentLang}`] || ""}
                      onChange={e => handleFieldChange("address", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-muted-foreground uppercase">Haqqında / Təsvir ({currentLang.toUpperCase()})</label>
                    <textarea 
                      rows={4}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      value={(formData as any)[`description_${currentLang}`] || ""}
                      onChange={e => handleFieldChange("description", e.target.value)}
                    />
                  </div>
                </motion.div>

                <div className="flex gap-3 pt-4 border-t border-border mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80 transition-colors">Ləğv et</button>
                  <button type="submit" className="flex-[2] py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-colors shadow-md">Yadda Saxla</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
