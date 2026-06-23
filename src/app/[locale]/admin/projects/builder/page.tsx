"use client";

import { useState } from "react";
import { Plus, Trash2, Save, GripVertical, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type FieldType = "text" | "textarea" | "select";

interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // For select type
}

export default function AdminFormBuilderPage() {
  const [formName, setFormName] = useState("Yeni Müraciət Formu");
  const [fields, setFields] = useState<FormField[]>([
    { id: "field_1", label: "Adınız və Soyadınız", type: "text", required: true },
    { id: "field_2", label: "Motivasiya məktubunuz", type: "textarea", required: true }
  ]);

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: "Yeni Sual",
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

  const handleSave = () => {
    const outputJSON = JSON.stringify({
      formName,
      fields
    }, null, 2);
    
    // Simulate saving
    alert("Form yadda saxlanıldı!\n\nGenerasiya edilən JSON (Konsola baxın):");
    console.log(outputJSON);
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

        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm mb-6">
          <input 
            type="text" 
            className="w-full text-2xl font-bold bg-transparent border-b-2 border-transparent hover:border-border focus:border-primary focus:outline-none transition-colors pb-2 mb-8"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />

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
                        <label className="text-xs font-bold text-muted-foreground uppercase">Sual (Label)</label>
                        <input 
                          type="text" 
                          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
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
                        <label className="text-xs font-bold text-muted-foreground uppercase">Seçimlər (Vergüllə ayırın)</label>
                        <input 
                          type="text" 
                          placeholder="Məs: Bəli, Xeyr, Bəlkə"
                          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                          value={field.options?.join(", ") || ""}
                          onChange={(e) => updateField(field.id, { options: e.target.value.split(",").map(s => s.trim()) })}
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
            <Settings className="w-5 h-5 text-zinc-400" /> JSON Nəticə (Output)
          </h3>
          <p className="text-xs text-zinc-500 mb-4">Məlumat bazasına bu formatda yazılacaq:</p>
          <pre className="text-xs font-mono bg-black/50 p-4 rounded-xl overflow-x-auto border border-zinc-800">
            {JSON.stringify({ formName, fields }, null, 2)}
          </pre>
        </div>
      </div>

    </div>
  );
}
