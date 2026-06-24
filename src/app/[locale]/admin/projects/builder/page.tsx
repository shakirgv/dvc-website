"use client";

import { useState } from "react";
import { Plus, Trash2, Save, GripVertical, Settings, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

type Language = "az" | "en" | "ru";

type FieldType = "text" | "textarea" | "select";

interface FormField {
  id: string;
  label_az: string; label_en: string; label_ru: string;
  type: FieldType;
  required: boolean;
  options_az?: string[]; options_en?: string[]; options_ru?: string[];
}

export default function AdminFormBuilderPage() {
  const [currentLang, setCurrentLang] = useState<Language>("az");
  
  // Project settings
  const [projectData, setProjectData] = useState({
    title_az: "Yeni Layihə", title_en: "", title_ru: "",
    description_az: "", description_en: "", description_ru: "",
    slug: "",
    image_url: "",
    status: "Active"
  });

  const [fields, setFields] = useState<FormField[]>([
    { id: "field_1", label_az: "Adınız və Soyadınız", label_en: "Full Name", label_ru: "ФИО", type: "text", required: true },
    { id: "field_2", label_az: "Motivasiya məktubunuz", label_en: "Motivation letter", label_ru: "Мотивационное письмо", type: "textarea", required: true }
  ]);

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      label_az: "Yeni Sual", label_en: "", label_ru: "",
      type: "text",
      required: false
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleSave = async () => {
    if (!projectData.slug) {
      alert("Layihə üçün 'Slug' daxil edilməlidir!");
      return;
    }

    const payload = {
      ...projectData,
      form_schema: { fields }
    };

    const { data, error } = await supabase.from("projects").insert([payload]);
    if (error) {
      alert("Xəta baş verdi: " + error.message);
    } else {
      alert("Layihə və form uğurla bazaya əlavə edildi!");
      console.log(payload);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* BUILDER PANEL */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Dinamik Form Builder</h1>
            <p className="text-muted-foreground mt-1">Layihələr üçün yeni qeydiyyat forması hazırlayın.</p>
          </div>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-hover transition-colors"
          >
            <Save className="w-5 h-5" /> Yadda Saxla
          </button>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm mb-6 space-y-6">
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
                  <motion.div layoutId="activeLangTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-muted-foreground uppercase">Layihə Adı ({currentLang.toUpperCase()})</label>
              <input 
                type="text" 
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={(projectData as any)[`title_${currentLang}`]}
                onChange={(e) => setProjectData({...projectData, [`title_${currentLang}`]: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-muted-foreground uppercase">URL Slug</label>
              <input 
                type="text" 
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                value={projectData.slug}
                onChange={(e) => setProjectData({...projectData, slug: e.target.value})}
                placeholder="meselen: layihe-2026"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-bold text-muted-foreground uppercase">Təsvir ({currentLang.toUpperCase()})</label>
              <textarea 
                rows={3}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                value={(projectData as any)[`description_${currentLang}`]}
                onChange={(e) => setProjectData({...projectData, [`description_${currentLang}`]: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm mb-6">
          <h2 className="text-xl font-bold mb-6">Dinamik Suallar</h2>

          <div className="space-y-4">
            <AnimatePresence>
              {fields.map((field, index) => (
                <motion.div 
                  key={field.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-muted/20 border border-border group"
                >
                  <div className="mt-2 text-muted-foreground cursor-grab">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Sual (Label - {currentLang.toUpperCase()})</label>
                        <input 
                          type="text" 
                          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                          value={(field as any)[`label_${currentLang}`] || ""}
                          onChange={(e) => updateField(field.id, { [`label_${currentLang}`]: e.target.value })}
                        />
                      </div>
                      <div className="w-full sm:w-48 space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Sual Tipi</label>
                        <select 
                          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                          value={field.type}
                          onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
                        >
                          <option value="text">Qısa Mətn (Text)</option>
                          <option value="textarea">Geniş Mətn (Textarea)</option>
                          <option value="select">Seçim (Dropdown)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded text-primary border-border focus:ring-primary/50 bg-background"
                          checked={field.required}
                          onChange={(e) => updateField(field.id, { required: e.target.checked })}
                        />
                        Məcburi Sual (Required)
                      </label>
                    </div>

                    {field.type === "select" && (
                      <div className="space-y-1.5 pt-2 border-t border-border">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Seçimlər ({currentLang.toUpperCase()}) (Vergüllə ayırın)</label>
                        <input 
                          type="text" 
                          placeholder="Məs: Bəli, Xeyr, Bəlkə"
                          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                          value={((field as any)[`options_${currentLang}`] || []).join(", ")}
                          onChange={(e) => updateField(field.id, { [`options_${currentLang}`]: e.target.value.split(",").map(s => s.trim()) })}
                        />
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => removeField(field.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            <button 
              onClick={addField}
              className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-border rounded-2xl text-muted-foreground hover:text-foreground hover:border-primary hover:bg-primary/5 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" /> Yeni Sual Əlavə Et
            </button>
          </div>
        </div>
      </div>

      {/* JSON PREVIEW */}
      <div className="w-full lg:w-80 shrink-0">
        <div className="bg-zinc-900 rounded-3xl p-6 shadow-xl sticky top-24 text-zinc-300">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-zinc-400" /> JSON Nəticə (Daxili)
          </h3>
          <p className="text-xs text-zinc-500 mb-4">Bazaya bu strukturla yazılır:</p>
          <pre className="text-xs font-mono bg-black/50 p-4 rounded-xl overflow-x-auto border border-zinc-800 h-[600px]">
            {JSON.stringify({ ...projectData, form_schema: { fields } }, null, 2)}
          </pre>
        </div>
      </div>

    </div>
  );
}
