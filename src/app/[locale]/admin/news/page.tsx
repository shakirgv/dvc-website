"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Eye, X, Image as ImageIcon, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

type Language = "az" | "en" | "ru";

interface NewsItem {
  id: string;
  title_az: string; title_en: string; title_ru: string;
  excerpt_az: string; excerpt_en: string; excerpt_ru: string;
  content_az: string; content_en: string; content_ru: string;
  image_url: string;
  status: string;
  views: number;
  created_at: string;
}

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>("az");
  
  // Form State
  const [formData, setFormData] = useState<Partial<NewsItem>>({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (data) {
      setNews(data);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu xəbəri silmək istədiyinizə əminsiniz?")) {
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (!error) {
        setNews(news.filter(n => n.id !== id));
      }
    }
  };

  const handleEdit = (item: NewsItem) => {
    setFormData(item);
    setCurrentLang("az");
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setFormData({
      title_az: "", title_en: "", title_ru: "",
      excerpt_az: "", excerpt_en: "", excerpt_ru: "",
      content_az: "", content_en: "", content_ru: "",
      image_url: "",
      status: "Draft",
      views: 0
    });
    setCurrentLang("az");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      // Update
      const { data, error } = await supabase
        .from("news")
        .update(formData)
        .eq("id", formData.id)
        .select();
      if (data && data.length > 0) {
        setNews(news.map(n => n.id === formData.id ? data[0] : n));
      }
    } else {
      // Insert
      const { data, error } = await supabase
        .from("news")
        .insert([formData])
        .select();
      if (data && data.length > 0) {
        setNews([data[0], ...news]);
      }
    }
    setIsModalOpen(false);
  };

  const handleFieldChange = (field: string, value: string) => {
    // If it's a multi-lang field like "title", we append the current language e.g. "title_az"
    setFormData(prev => ({ ...prev, [`${field}_${currentLang}`]: value }));
  };

  const handleGlobalChange = (field: string, value: string) => {
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

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Xəbərlərin İdarəedilməsi</h1>
          <p className="text-muted-foreground mt-1">Ana səhifədəki xəbərləri əlavə edin, yeniləyin və ya silin.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-hover transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Yeni Xəbər
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
                <th className="px-6 py-4 font-medium">Başlıq (AZ)</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {news.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-medium max-w-xs truncate">{item.title_az || "Adı yoxdur"}</td>
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
              {news.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                    Heç bir xəbər tapılmadı.
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
              className="w-full max-w-3xl bg-card border border-border rounded-3xl shadow-2xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-2xl font-bold mb-6">{formData.id ? "Xəbəri Redaktə Et" : "Yeni Xəbər Yarat"}</h3>
              
              <form onSubmit={handleSave} className="space-y-6">
                
                {/* GLOBAL SETTINGS */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-2xl border border-border">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-muted-foreground uppercase">Status</label>
                    <select 
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={formData.status || "Draft"}
                      onChange={e => handleGlobalChange("status", e.target.value)}
                    >
                      <option value="Active">Aktiv (Saytda Göstər)</option>
                      <option value="Draft">Qaralama (Draft)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-muted-foreground uppercase flex items-center justify-between">
                      <span>Şəkil (URL və ya Yüklə)</span>
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
                    <label className="text-sm font-bold text-muted-foreground uppercase">Başlıq ({currentLang.toUpperCase()})</label>
                    <input 
                      required={currentLang === "az"} 
                      type="text" 
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={(formData as any)[`title_${currentLang}`] || ""}
                      onChange={e => handleFieldChange("title", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-muted-foreground uppercase">Qısa Məzmun ({currentLang.toUpperCase()})</label>
                    <textarea 
                      required={currentLang === "az"} 
                      rows={2}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      value={(formData as any)[`excerpt_${currentLang}`] || ""}
                      onChange={e => handleFieldChange("excerpt", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-muted-foreground uppercase">Geniş Məzmun ({currentLang.toUpperCase()})</label>
                    <textarea 
                      rows={6}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm resize-none custom-scrollbar"
                      value={(formData as any)[`content_${currentLang}`] || ""}
                      onChange={e => handleFieldChange("content", e.target.value)}
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
