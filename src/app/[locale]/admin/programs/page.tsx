"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Edit2, Trash2, X, Image as ImageIcon, Globe, 
  Link as LinkIcon, Bold, Italic, Heading1, Heading2, 
  List, Trash, Eye, Sparkles, Check, AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { logAdminAction } from "@/lib/audit-logger";

type Language = "az" | "en" | "ru";

interface StatItem {
  value: string;
  label_az: string;
  label_en: string;
  label_ru: string;
}

interface ProgramItem {
  id: string;
  slug: string;
  logo_url: string;
  banner_url: string;
  title_az: string; title_en: string; title_ru: string;
  short_desc_az: string; short_desc_en: string; short_desc_ru: string;
  content_az: string; content_en: string; content_ru: string;
  stats_json: StatItem[];
  gallery_urls: string[];
  registration_link: string;
  is_registration_active: boolean;
  order_index: number;
  status: string;
  created_at?: string;
}

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>("az");
  
  // Form State
  const [formData, setFormData] = useState<Partial<ProgramItem>>({});
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Stats Sub-state
  const [statsList, setStatsList] = useState<StatItem[]>([]);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .order("order_index", { ascending: true });
        
      if (error) throw error;
      if (data) {
        setPrograms(data.map(p => ({
          ...p,
          stats_json: Array.isArray(p.stats_json) 
            ? p.stats_json 
            : typeof p.stats_json === "string" 
              ? JSON.parse(p.stats_json) 
              : [],
          gallery_urls: Array.isArray(p.gallery_urls) ? p.gallery_urls : []
        })));
      }
    } catch (err) {
      console.error("Error loading programs:", err);
      alert("Proqramları yükləyərkən xəta baş verdi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu proqramı silmək istədiyinizə əminsiniz? Səhifə və qalereya şəkilləri itəcəkdir.")) {
      try {
        const { error } = await supabase.from("programs").delete().eq("id", id);
        if (error) throw error;
        const deletedProgram = programs.find(p => p.id === id);
        setPrograms(programs.filter(p => p.id !== id));
        await logAdminAction(`Proqram silindi: ${deletedProgram?.title_az || "Adsız"}`, "Programs");
      } catch (err: any) {
        alert("Silinmə zamanı xəta: " + err.message);
      }
    }
  };

  const handleEdit = (program: ProgramItem) => {
    setFormData(program);
    setStatsList(program.stats_json || []);
    setCurrentLang("az");
    setIsPreviewOpen(false);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setFormData({
      status: "Active",
      order_index: 0,
      is_registration_active: false,
      gallery_urls: [],
      stats_json: [],
      registration_link: "",
      logo_url: "",
      banner_url: "",
      title_az: "", title_en: "", title_ru: "",
      short_desc_az: "", short_desc_en: "", short_desc_ru: "",
      content_az: "", content_en: "", content_ru: "",
      slug: ""
    });
    setStatsList([]);
    setCurrentLang("az");
    setIsPreviewOpen(false);
    setIsModalOpen(true);
  };

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("dvc_images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("dvc_images").getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err: any) {
      alert("Şəkil yüklənərkən xəta baş verdi: " + err.message);
      return null;
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    const url = await uploadImage(file, "program-logos");
    if (url) {
      handleGlobalChange("logo_url", url);
    }
    setIsUploadingLogo(false);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBanner(true);
    const url = await uploadImage(file, "program-banners");
    if (url) {
      handleGlobalChange("banner_url", url);
    }
    setIsUploadingBanner(false);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploadingGallery(true);
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const url = await uploadImage(files[i], "program-gallery");
      if (url) {
        uploadedUrls.push(url);
      }
    }

    setFormData(prev => ({
      ...prev,
      gallery_urls: [...(prev.gallery_urls || []), ...uploadedUrls]
    }));
    setIsUploadingGallery(false);
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      gallery_urls: (prev.gallery_urls || []).filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleGenerateSlug = () => {
    const title = formData.title_az || "";
    const generated = title
      .toLowerCase()
      .trim()
      // Replace Azerbaijani specific characters
      .replace(/ə/g, 'e')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ç/g, 'c')
      .replace(/ğ/g, 'g')
      // Replace other non-alphanumeric chars with hyphens
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
      
    handleGlobalChange("slug", generated);
  };

  // Stats operations
  const handleAddStat = () => {
    setStatsList([...statsList, { value: "", label_az: "", label_en: "", label_ru: "" }]);
  };

  const handleRemoveStat = (index: number) => {
    setStatsList(statsList.filter((_, idx) => idx !== index));
  };

  const handleStatChange = (index: number, key: keyof StatItem, val: string) => {
    const updated = statsList.map((stat, idx) => {
      if (idx === index) {
        return { ...stat, [key]: val };
      }
      return stat;
    });
    setStatsList(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.slug) {
      alert("Zəhmət olmasa URL Slug daxil edin.");
      return;
    }
    
    const dataToSave = {
      ...formData,
      title_az: formData.title_az || "",
      title_en: formData.title_en || "",
      title_ru: formData.title_ru || "",
      short_desc_az: formData.short_desc_az || "",
      short_desc_en: formData.short_desc_en || "",
      short_desc_ru: formData.short_desc_ru || "",
      content_az: formData.content_az || "",
      content_en: formData.content_en || "",
      content_ru: formData.content_ru || "",
      stats_json: statsList, // Store stats array
    };

    try {
      if (dataToSave.id) {
        const { data, error } = await supabase
          .from("programs")
          .update(dataToSave)
          .eq("id", dataToSave.id)
          .select()
          .single();
          
        if (error) throw error;
        if (data) {
          setPrograms(programs.map(p => p.id === data.id ? {
            ...data,
            stats_json: Array.isArray(data.stats_json) ? data.stats_json : []
          } : p));
          await logAdminAction(`Proqram yeniləndi: ${dataToSave.title_az || "Adsız"}`, "Programs");
          setIsModalOpen(false);
        }
      } else {
        const { data, error } = await supabase
          .from("programs")
          .insert([dataToSave])
          .select()
          .single();
          
        if (error) throw error;
        if (data) {
          setPrograms([...programs, {
            ...data,
            stats_json: Array.isArray(data.stats_json) ? data.stats_json : []
          }]);
          await logAdminAction(`Yeni proqram yaradıldı: ${dataToSave.title_az || "Adsız"}`, "Programs");
          setIsModalOpen(false);
        }
      }
    } catch (err: any) {
      console.error("Save error:", err);
      alert("Yadda saxlanılarkən xəta: " + err.message);
    }
  };

  const handleGlobalChange = (key: keyof ProgramItem, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFieldChange = (baseField: "title" | "short_desc" | "content", value: string) => {
    setFormData(prev => ({ ...prev, [`${baseField}_${currentLang}`]: value }));
  };

  // HTML insert toolbar helper
  const insertHtmlTag = (before: string, after: string) => {
    const textareaId = `content-editor-${currentLang}`;
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const replacement = before + (selectedText || "mətn") + after;

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    
    handleFieldChange("content", newValue);

    // Refocus and place selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (selectedText || "mətn").length);
    }, 50);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Proqramlar</h2>
          <p className="text-muted-foreground mt-1">Dinamik proqram və layihə səhifələrini, infobox statlarını, loqo, banner və qalereyaları buradan idarə edin.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-primary/20 cursor-pointer"
        >
          <Plus className="w-5 h-5" /> Yeni Proqram Əlavə Et
        </button>
      </div>

      {/* Programs List Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm min-h-[300px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            <span>Məlumatlar yüklənir...</span>
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Sıra</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Loqo</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Başlıq (AZ)</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">URL Slug</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Qeydiyyat</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {programs.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-semibold text-muted-foreground">{item.order_index}</td>
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 rounded-lg bg-white border border-border flex items-center justify-center p-1 overflow-hidden">
                      {item.logo_url ? (
                        <img src={item.logo_url} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold max-w-xs truncate">{item.title_az || "Adsız"}</td>
                  <td className="px-6 py-4 text-xs font-mono text-muted-foreground">/{item.slug || "yoxdur"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                      item.is_registration_active ? "bg-purple-500/10 text-purple-600 border border-purple-500/20" : "bg-muted text-muted-foreground"
                    }`}>
                      {item.is_registration_active ? "Aktiv" : "Deaktiv"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                      item.status === "Active" ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"
                    }`}>
                      {item.status === "Active" ? "Aktiv" : "Qaralama"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Redaktə Et"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {programs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    Heç bir proqram tapılmadı. İlk proqramı əlavə etmək üçün "Yeni Proqram Əlavə Et" düyməsini sıxın.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Form Modal (Create/Edit) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl bg-card border border-border rounded-3xl shadow-2xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-2xl font-bold mb-6 text-foreground">
                {formData.id ? "Proqramı Redaktə Et" : "Yeni Proqram Yarat"}
              </h3>
              
              <form onSubmit={handleSave} className="space-y-6">
                
                {/* 1. CONFIG METADATA */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-muted/20 rounded-2xl border border-border/80">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Sıra (Order Index)</label>
                    <input 
                      type="number" 
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-semibold"
                      value={formData.order_index || 0}
                      onChange={e => handleGlobalChange("order_index", parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</label>
                    <select 
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-semibold"
                      value={formData.status || "Active"}
                      onChange={e => handleGlobalChange("status", e.target.value)}
                    >
                      <option value="Active">Aktiv (Saytda Göstər)</option>
                      <option value="Draft">Qaralama (Gizlət)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                      <span>URL Slug</span>
                      <button 
                        type="button" 
                        onClick={handleGenerateSlug}
                        className="text-xs text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        title="AZ Başlığa əsasən slug yarat"
                      >
                        <Sparkles className="w-3 h-3" /> Avto-Yarat
                      </button>
                    </label>
                    <input 
                      type="text" 
                      placeholder="məsələn: youth-inc"
                      required
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-mono font-bold"
                      value={formData.slug || ""}
                      onChange={e => handleGlobalChange("slug", e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    />
                  </div>
                </div>

                {/* 2. REGISTRATION CONTROLS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-purple-500/5 rounded-2xl border border-purple-500/20 items-end">
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      Qeydiyyat Statusu
                    </label>
                    <div className="flex items-center gap-3 bg-background border border-border/80 rounded-xl px-4 py-2">
                      <input 
                        type="checkbox"
                        id="is_reg_active"
                        className="w-5 h-5 rounded text-primary focus:ring-primary bg-background border-border"
                        checked={formData.is_registration_active || false}
                        onChange={e => handleGlobalChange("is_registration_active", e.target.checked)}
                      />
                      <label htmlFor="is_reg_active" className="text-sm font-bold text-foreground cursor-pointer">
                        {formData.is_registration_active ? "Qeydiyyat Açıqdır" : "Qeydiyyat Bağlıdır"}
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                      Müraciət (Qeydiyyat) Linki
                    </label>
                    <input 
                      type="text" 
                      placeholder="https://..."
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                      value={formData.registration_link || ""}
                      onChange={e => handleGlobalChange("registration_link", e.target.value)}
                    />
                  </div>
                </div>

                {/* 3. MEDIA FILES MANAGER */}
                <div className="bg-card border border-border p-5 rounded-2xl space-y-6">
                  <h4 className="text-sm font-bold text-foreground border-b border-border pb-2">Media Resursları</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Logo upload */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase flex justify-between items-center">
                        <span>Proqramın Loqosu (Unique Logo)</span>
                        {isUploadingLogo && <span className="text-xs text-primary animate-pulse">Yüklənir...</span>}
                      </label>
                      
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center p-2 overflow-hidden shrink-0">
                          {formData.logo_url ? (
                            <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain" />
                          ) : (
                            <ImageIcon className="w-7 h-7 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <input 
                            type="text" 
                            placeholder="https://..."
                            className="w-full bg-background border border-border rounded-xl px-4 py-2 text-xs text-foreground"
                            value={formData.logo_url || ""}
                            onChange={e => handleGlobalChange("logo_url", e.target.value)}
                          />
                          <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold border border-border rounded-lg cursor-pointer transition-colors">
                            <ImageIcon className="w-4 h-4" /> Kompüterdən seç
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handleLogoUpload}
                              disabled={isUploadingLogo}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Banner upload */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase flex justify-between items-center">
                        <span>Cover Banner Şəkli (Header Banner)</span>
                        {isUploadingBanner && <span className="text-xs text-primary animate-pulse">Yüklənir...</span>}
                      </label>
                      
                      <div className="flex gap-4 items-center">
                        <div className="w-20 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0">
                          {formData.banner_url ? (
                            <img src={formData.banner_url} alt="Banner" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-7 h-7 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <input 
                            type="text" 
                            placeholder="https://..."
                            className="w-full bg-background border border-border rounded-xl px-4 py-2 text-xs text-foreground"
                            value={formData.banner_url || ""}
                            onChange={e => handleGlobalChange("banner_url", e.target.value)}
                          />
                          <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold border border-border rounded-lg cursor-pointer transition-colors">
                            <ImageIcon className="w-4 h-4" /> Kompüterdən seç
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handleBannerUpload}
                              disabled={isUploadingBanner}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Multiple Gallery Images */}
                  <div className="border-t border-border pt-4 space-y-3">
                    <label className="text-xs font-bold text-muted-foreground uppercase flex justify-between items-center">
                      <span>Daxili Foto Qalereya (4-6 Ədəd Şəkil)</span>
                      {isUploadingGallery && <span className="text-xs text-primary animate-pulse">Yüklənir...</span>}
                    </label>

                    {/* Previews and Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {(formData.gallery_urls || []).map((url, index) => (
                        <div key={index} className="aspect-4/3 rounded-xl border border-border bg-muted relative group overflow-hidden">
                          <img src={url} alt="Gallery" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold text-xs cursor-pointer"
                          >
                            Sil
                          </button>
                        </div>
                      ))}

                      {/* Add Gallery images button box */}
                      <label className="aspect-4/3 border-2 border-dashed border-border hover:border-primary rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-muted/30 transition-all text-muted-foreground hover:text-foreground">
                        <Plus className="w-6 h-6" />
                        <span className="text-[10px] font-bold">Şəkillər Əlavə Et</span>
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleGalleryUpload}
                          disabled={isUploadingGallery}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* 4. STATISTICS JSON EDITOR */}
                <div className="bg-card border border-border p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-border pb-2">
                    <h4 className="text-sm font-bold text-foreground">İnfobox Statistika Göstəriciləri</h4>
                    <button
                      type="button"
                      onClick={handleAddStat}
                      className="text-xs text-primary hover:text-primary-hover font-bold flex items-center gap-1 cursor-pointer bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg"
                    >
                      <Plus className="w-3.5 h-3.5" /> Göstərici Əlavə Et
                    </button>
                  </div>

                  {statsList.length > 0 ? (
                    <div className="space-y-3">
                      {statsList.map((stat, index) => (
                        <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center bg-muted/30 border border-border/80 p-3 rounded-xl relative">
                          <div className="sm:col-span-3">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-0.5">Dəyər (Məs: 25+)</label>
                            <input 
                              type="text" 
                              required
                              placeholder="25+"
                              className="w-full bg-background border border-border rounded-lg px-2.5 py-1 text-xs text-foreground font-bold"
                              value={stat.value || ""}
                              onChange={e => handleStatChange(index, "value", e.target.value)}
                            />
                          </div>
                          
                          <div className="sm:col-span-3">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-0.5">Etiket (AZ)</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Aktiv Klub"
                              className="w-full bg-background border border-border rounded-lg px-2.5 py-1 text-xs text-foreground"
                              value={stat.label_az || ""}
                              onChange={e => handleStatChange(index, "label_az", e.target.value)}
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-0.5">Etiket (EN)</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Active Clubs"
                              className="w-full bg-background border border-border rounded-lg px-2.5 py-1 text-xs text-foreground"
                              value={stat.label_en || ""}
                              onChange={e => handleStatChange(index, "label_en", e.target.value)}
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-0.5">Etiket (RU)</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Активные Клубы"
                              className="w-full bg-background border border-border rounded-lg px-2.5 py-1 text-xs text-foreground"
                              value={stat.label_ru || ""}
                              onChange={e => handleStatChange(index, "label_ru", e.target.value)}
                            />
                          </div>

                          <div className="sm:col-span-1 text-right mt-3 sm:mt-0">
                            <button
                              type="button"
                              onClick={() => handleRemoveStat(index)}
                              className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Göstəricini sil"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic text-center py-4 bg-muted/10 border border-dashed border-border rounded-xl">
                      Heç bir statistika göstəricisi yoxdur. "Göstərici Əlavə Et" düyməsi ilə infobox statları daxil edə bilərsiniz.
                    </div>
                  )}
                </div>

                {/* 5. LANGUAGE TABS & LOCALIZED FIELDS */}
                <div className="space-y-4">
                  <div className="border-b border-border flex gap-2 overflow-x-auto pb-px">
                    {(["az", "en", "ru"] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setCurrentLang(lang)}
                        className={`pb-3 px-4 font-bold text-sm uppercase transition-colors relative flex items-center gap-1.5 cursor-pointer ${
                          currentLang === lang ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Globe className="w-4 h-4" />
                        {lang === "az" ? "Azərbaycanca" : lang === "en" ? "İngiliscə" : "Rusca"}
                      </button>
                    ))}
                  </div>

                  {/* MULTI-LANGUAGE INPUTS */}
                  <motion.div
                    key={currentLang}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4"
                  >
                    {/* Title */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Proqramın Adı ({currentLang.toUpperCase()})</label>
                      <input 
                        required={currentLang === "az"} 
                        type="text" 
                        placeholder="Məsələn: Milli Debat Proqramı"
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-bold"
                        value={(formData as any)[`title_${currentLang}`] || ""}
                        onChange={e => handleFieldChange("title", e.target.value)}
                      />
                    </div>

                    {/* Short description */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Qısa Təsvir (Kartda görünəcək mətn - {currentLang.toUpperCase()})</label>
                      <textarea 
                        rows={2}
                        placeholder="Proqramın ana səhifədəki kartında görünəcək qısa cəlbedici təsviri..."
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground resize-none"
                        value={(formData as any)[`short_desc_${currentLang}`] || ""}
                        onChange={e => handleFieldChange("short_desc", e.target.value)}
                      />
                    </div>

                    {/* Rich text HTML content */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Daxili Səhifə Ətraflı Mətni (Rich Text / HTML - {currentLang.toUpperCase()})
                        </label>
                        
                        <button
                          type="button"
                          onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                          className="text-xs text-primary font-semibold flex items-center gap-1 cursor-pointer bg-primary/10 px-2 py-0.5 rounded"
                        >
                          <Eye className="w-3.5 h-3.5" /> {isPreviewOpen ? "Redaktora keç" : "Canlı önbaxış"}
                        </button>
                      </div>

                      {isPreviewOpen ? (
                        /* Live preview of HTML content */
                        <div className="border border-border rounded-xl p-4 bg-muted/20 min-h-[250px] max-h-[400px] overflow-y-auto">
                          {(formData as any)[`content_${currentLang}`] ? (
                            <div 
                              className="prose prose-slate dark:prose-invert max-w-none text-sm text-foreground space-y-2
                                [&>p]:text-sm [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic"
                              dangerouslySetInnerHTML={{ __html: (formData as any)[`content_${currentLang}`] }}
                            />
                          ) : (
                            <span className="text-muted-foreground italic text-xs">Məzmun boşdur, daxil edilmiş HTML burada render ediləcək.</span>
                          )}
                        </div>
                      ) : (
                        /* HTML Editor Textarea with Toolbar */
                        <div className="border border-border rounded-xl overflow-hidden bg-background">
                          {/* Formatting Toolbar */}
                          <div className="bg-muted/40 border-b border-border p-2 flex flex-wrap gap-1.5 items-center select-none">
                            <button 
                              type="button" 
                              onClick={() => insertHtmlTag("<strong>", "</strong>")}
                              className="p-1.5 hover:bg-muted rounded text-foreground cursor-pointer" 
                              title="Bold"
                            >
                              <Bold className="w-4 h-4" />
                            </button>
                            <button 
                              type="button" 
                              onClick={() => insertHtmlTag("<em>", "</em>")}
                              className="p-1.5 hover:bg-muted rounded text-foreground cursor-pointer" 
                              title="Italic"
                            >
                              <Italic className="w-4 h-4" />
                            </button>
                            <button 
                              type="button" 
                              onClick={() => insertHtmlTag("<h1>", "</h1>")}
                              className="p-1.5 hover:bg-muted rounded text-foreground cursor-pointer font-bold text-xs" 
                              title="Heading 1"
                            >
                              H1
                            </button>
                            <button 
                              type="button" 
                              onClick={() => insertHtmlTag("<h2>", "</h2>")}
                              className="p-1.5 hover:bg-muted rounded text-foreground cursor-pointer font-bold text-xs" 
                              title="Heading 2"
                            >
                              H2
                            </button>
                            <button 
                              type="button" 
                              onClick={() => insertHtmlTag("<ul>\n  <li>", "</li>\n  <li>Bənd 2</li>\n</ul>")}
                              className="p-1.5 hover:bg-muted rounded text-foreground cursor-pointer" 
                              title="Bullet List"
                            >
                              <List className="w-4 h-4" />
                            </button>
                            <button 
                              type="button" 
                              onClick={() => insertHtmlTag('<a href="https://..." target="_blank" class="text-primary underline">', "</a>")}
                              className="p-1.5 hover:bg-muted rounded text-foreground cursor-pointer" 
                              title="Insert Link"
                            >
                              <LinkIcon className="w-4 h-4" />
                            </button>
                            <button 
                              type="button" 
                              onClick={() => insertHtmlTag("", "<br />")}
                              className="p-1 py-0.5 hover:bg-muted rounded text-foreground cursor-pointer font-mono text-[10px] border border-border" 
                              title="Line Break"
                            >
                              BR
                            </button>
                          </div>
                          
                          <textarea 
                            id={`content-editor-${currentLang}`}
                            rows={10}
                            placeholder="Proqramın daxili səhifəsində görünəcək ətraflı məzmun mətni... HTML teqlərindən sərbəst istifadə edə bilərsiniz."
                            className="w-full bg-transparent border-0 rounded-b-xl px-4 py-3 focus:outline-none focus:ring-0 text-foreground font-mono text-sm resize-y min-h-[200px]"
                            value={(formData as any)[`content_${currentLang}`] || ""}
                            onChange={e => handleFieldChange("content", e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Submitting buttons */}
                <div className="flex gap-3 pt-6 border-t border-border mt-8">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="flex-1 py-3 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80 transition-colors cursor-pointer"
                  >
                    Ləğv et
                  </button>
                  <button 
                    type="submit" 
                    className="flex-[2] py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all shadow-md cursor-pointer"
                  >
                    Yadda Saxla
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
