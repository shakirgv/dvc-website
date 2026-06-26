"use client";

import { useState } from "react";
import { Send, BellRing, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/audit-logger";

export default function AdminBroadcastPage() {
  const supabase = createClient();
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info",
    targetType: "all",
    targetInput: "",
    action_url: "",
    action_text: ""
  });

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return alert("Başlıq və mətn mütləqdir.");

    setIsSending(true);

    // Get current user (admin)
    const { data: { user } } = await supabase.auth.getUser();

    // Determine target users
    let target_user_ids: string[] | null = null;
    
    if (formData.targetType !== "all" && formData.targetInput.trim()) {
      const inputs = formData.targetInput.split(/[\n,]+/).map(i => i.trim()).filter(i => i);
      
      if (inputs.length > 0) {
        const column = formData.targetType === "dvc_id" ? "dvc_id" : "email";
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("id")
          .in(column, inputs);
          
        if (usersError) {
          alert("İstifadəçilər axtarılarkən xəta baş verdi: " + usersError.message);
          setIsSending(false);
          return;
        }
        
        if (!usersData || usersData.length === 0) {
          alert(`Daxil edilən ${formData.targetType === 'dvc_id' ? 'DVC ID' : 'E-poçt'} üzrə istifadəçi tapılmadı.`);
          setIsSending(false);
          return;
        }
        
        target_user_ids = usersData.map(u => u.id);
      }
    }

    // 1. Insert notification into the DB
    const { error } = await supabase.from("notifications").insert({
      title: formData.title,
      content: formData.content,
      type: formData.type,
      created_by: user?.id,
      target_user_ids: target_user_ids,
      action_url: formData.action_url || null,
      action_text: formData.action_text || null
    });

    if (error) {
      alert("Bildiriş göndərilərkən xəta baş verdi: " + error.message);
      setIsSending(false);
      return;
    }

    // 2. Log in Audit Logs
    const targetMsg = formData.targetType === "all" ? "bütün istifadəçilərə" : `${target_user_ids?.length} fərdi istifadəçiyə`;
    await logAdminAction(`Kütləvi bildiriş göndərildi (${targetMsg}): "${formData.title}"`, "Broadcast");

    setIsSending(false);
    alert(`Bildiriş uğurla ${targetMsg} göndərildi!`);
    setFormData({ title: "", content: "", type: "info", targetType: "all", targetInput: "", action_url: "", action_text: "" });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          <BellRing className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Kütləvi Elan Mərkəzi</h1>
          <p className="text-muted-foreground mt-1">Sistemdəki bütün istifadəçilərə eyni anda daxili bildiriş göndərin.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
        <form onSubmit={handleBroadcast} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Bildirişin Növü</label>
              <select 
                className="w-full p-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="info">Məlumat (Mavi)</option>
                <option value="success">Uğurlu (Yaşıl)</option>
                <option value="warning">Xəbərdarlıq (Narıncı/Qırmızı)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ünvanlanır (Hədəf Kütlə)</label>
              <select 
                className="w-full p-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.targetType}
                onChange={e => setFormData({...formData, targetType: e.target.value})}
              >
                <option value="all">Bütün İstifadəçilərə (Global)</option>
                <option value="dvc_id">DVC ID ilə (Fərdi / Çoxlu)</option>
                <option value="email">E-poçt ilə (Fərdi / Çoxlu)</option>
              </select>
            </div>
          </div>

          {formData.targetType !== "all" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {formData.targetType === "dvc_id" ? "DVC ID-lər (vergül və ya enter ilə ayırın)" : "E-poçt ünvanları (vergül və ya enter ilə ayırın)"}
              </label>
              <textarea 
                rows={3}
                placeholder={formData.targetType === "dvc_id" ? "Məsələn: DVC-87239, DVC-10293" : "Məsələn: user1@gmail.com, user2@gmail.com"}
                className="w-full p-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-mono text-sm"
                value={formData.targetInput}
                onChange={e => setFormData({...formData, targetInput: e.target.value})}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Başlıq</label>
            <input 
              type="text" 
              required
              placeholder="Məsələn: Milli Debat Forumu 2026 Qeydiyyatı Başladı!" 
              className="w-full p-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg font-medium"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Məzmun (Mətn)</label>
            <textarea 
              required
              rows={6}
              placeholder="Gənclərə çatdırmaq istədiyiniz tam məlumatı bura yazın..." 
              className="w-full p-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Yönləndirmə Linki (URL) - İxtiyari</label>
              <input 
                type="url" 
                placeholder="https://..." 
                className="w-full p-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.action_url}
                onChange={e => setFormData({...formData, action_url: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Link Mətni - İxtiyari</label>
              <input 
                type="text" 
                placeholder="Məsələn: LİNK, Qeydiyyatdan Keç..." 
                className="w-full p-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.action_text}
                onChange={e => setFormData({...formData, action_text: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              * Bu bildiriş göndərildiyi an qeydiyyatdan keçmiş bütün istifadəçilərin şəxsi kabinetində "Zəng" (Bell) ikonunda görünəcək.
            </p>
            <button 
              type="submit"
              disabled={isSending || !formData.title || !formData.content}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {isSending ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Göndərilir...</>
              ) : (
                <><Send className="w-5 h-5" /> Göndər</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
