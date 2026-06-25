"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { logAdminAction } from "@/lib/audit-logger";

type Language = "az" | "en" | "ru";

interface TeamMember {
  id: string;
  name: string;
  role_az: string; role_en: string; role_ru: string;
  bio_az: string; bio_en: string; bio_ru: string;
  image_url: string;
  linkedin_url: string;
  instagram_url: string;
  facebook_url: string;
  mail_address: string;
  order_index: number;
  status: string;
  created_at: string;
}

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>("az");
  
  // Form State
  const [formData, setFormData] = useState<Partial<TeamMember>>({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("team_members")
      .select("*")
      .order("order_index", { ascending: true });
      
    if (data) {
      setMembers(data);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu şəxsi silmək istədiyinizə əminsiniz?")) {
      const { error } = await supabase.from("team_members").delete().eq("id", id);
      if (!error) {
        const deletedMember = members.find(m => m.id === id);
        setMembers(members.filter(m => m.id !== id));
        await logAdminAction(`Komanda üzvü silindi: ${deletedMember?.name || "Adsız"}`, "Team");
      }
    }
  };

  const handleEdit = (member: TeamMember) => {
    setFormData(member);
    setCurrentLang("az");
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setFormData({ status: "Active", order_index: 0 });
    setCurrentLang("az");
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `team-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("dvc_images")
      .upload(filePath, file);

    if (uploadError) {
      alert("Şəkil yüklənərkən xəta baş verdi: " + uploadError.message);
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage.from("dvc_images").getPublicUrl(filePath);
    handleGlobalChange("image_url", data.publicUrl);
    setIsUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fill empty fields to avoid NOT NULL constraint errors
    const dataToSave = {
      ...formData,
      role_az: formData.role_az || "",
      role_en: formData.role_en || "",
      role_ru: formData.role_ru || "",
      bio_az: formData.bio_az || "",
      bio_en: formData.bio_en || "",
      bio_ru: formData.bio_ru || "",
      linkedin_url: formData.linkedin_url || "",
      instagram_url: formData.instagram_url || "",
      facebook_url: formData.facebook_url || "",
      mail_address: formData.mail_address || "",
    };

    if (dataToSave.id) {
      const { data, error } = await supabase.from("team_members").update(dataToSave).eq("id", dataToSave.id).select().single();
      if (!error && data) {
        setMembers(members.map(m => m.id === data.id ? data : m));
        await logAdminAction(`Komanda üzvü yeniləndi: ${dataToSave.name || "Adsız"}`, "Team");
        setIsModalOpen(false);
      } else {
        alert("Xəta baş verdi: " + error?.message);
      }
    } else {
      const { data, error } = await supabase.from("team_members").insert([dataToSave]).select().single();
      if (!error && data) {
        setMembers([...members, data]);
        await logAdminAction(`Yeni komanda üzvü əlavə edildi: ${dataToSave.name || "Adsız"}`, "Team");
        setIsModalOpen(false);
      } else {
        alert("Xəta baş verdi: " + error?.message);
      }
    }
  };

  const handleGlobalChange = (key: keyof TeamMember, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFieldChange = (baseField: "role" | "bio", value: string) => {
    setFormData(prev => ({ ...prev, [`${baseField}_${currentLang}`]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Komanda və İdarə Heyəti</h2>
          <p className="text-muted-foreground mt-1">Ana səhifədəki komanda üzvlərini buradan idarə edə bilərsiniz.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-primary/20"
        >
          <Plus className="w-5 h-5" /> Yeni Üzv
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm min-h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">Yüklənir...</div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Sıra</th>
                <th className="px-6 py-4 font-medium">Ad / Soyad</th>
                <th className="px-6 py-4 font-medium">Vəzifə (AZ)</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-muted-foreground">{item.order_index}</td>
                  <td className="px-6 py-4 font-bold max-w-xs truncate">{item.name || "Adı yoxdur"}</td>
                  <td className="px-6 py-4 text-muted-foreground">{item.role_az || "-"}</td>
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
              {members.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Heç bir komanda üzvü tapılmadı.
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
              
              <h3 className="text-2xl font-bold mb-6">{formData.id ? "Üzvü Redaktə Et" : "Yeni Üzv Əlavə Et"}</h3>
              
              <form onSubmit={handleSave} className="space-y-6">
                
                {/* GLOBAL SETTINGS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-2xl border border-border">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase">Ad və Soyad</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={formData.name || ""}
                      onChange={e => handleGlobalChange("name", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-muted-foreground uppercase">Sıra (Order)</label>
                    <input 
                      type="number" 
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={formData.order_index || 0}
                      onChange={e => handleGlobalChange("order_index", parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-muted-foreground uppercase">Status</label>
                    <select 
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={formData.status || "Active"}
                      onChange={e => handleGlobalChange("status", e.target.value)}
                    >
                      <option value="Active">Aktiv (Saytda Göstər)</option>
                      <option value="Draft">Qaralama (Gizlət)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-sm font-bold text-muted-foreground uppercase">LinkedIn URL</label>
                    <input 
                      type="url" 
                      placeholder="https://linkedin.com/in/..."
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={formData.linkedin_url || ""}
                      onChange={e => handleGlobalChange("linkedin_url", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-sm font-bold text-muted-foreground uppercase">Instagram URL</label>
                    <input 
                      type="url" 
                      placeholder="https://instagram.com/..."
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={formData.instagram_url || ""}
                      onChange={e => handleGlobalChange("instagram_url", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-sm font-bold text-muted-foreground uppercase">Facebook URL</label>
                    <input 
                      type="url" 
                      placeholder="https://facebook.com/..."
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={formData.facebook_url || ""}
                      onChange={e => handleGlobalChange("facebook_url", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-sm font-bold text-muted-foreground uppercase">E-poçt (Mail)</label>
                    <input 
                      type="email" 
                      placeholder="ad.soyad@dvc.az"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={formData.mail_address || ""}
                      onChange={e => handleGlobalChange("mail_address", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase flex items-center justify-between">
                      <span>Şəkil URL</span>
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
                        <motion.div layoutId="activeTabTeam" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
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
                    <label className="text-sm font-bold text-muted-foreground uppercase">Vəzifə ({currentLang.toUpperCase()})</label>
                    <input 
                      required={currentLang === "az"} 
                      type="text" 
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={(formData as any)[`role_${currentLang}`] || ""}
                      onChange={e => handleFieldChange("role", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-muted-foreground uppercase">Bioqrafiya ({currentLang.toUpperCase()})</label>
                    <textarea 
                      rows={4}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      value={(formData as any)[`bio_${currentLang}`] || ""}
                      onChange={e => handleFieldChange("bio", e.target.value)}
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
