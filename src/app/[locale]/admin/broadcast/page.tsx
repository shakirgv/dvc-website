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
    type: "info"
  });

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return alert("Başlıq və mətn mütləqdir.");

    setIsSending(true);

    // Get current user (admin)
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Insert notification into the DB
    const { error } = await supabase.from("notifications").insert({
      title: formData.title,
      content: formData.content,
      type: formData.type,
      created_by: user?.id
    });

    if (error) {
      alert("Bildiriş göndərilərkən xəta baş verdi: " + error.message);
      setIsSending(false);
      return;
    }

    // 2. Log in Audit Logs
    await logAdminAction(`Kütləvi bildiriş göndərildi: "${formData.title}"`, "Broadcast");

    setIsSending(false);
    alert("Bildiriş uğurla bütün istifadəçilərə göndərildi!");
    setFormData({ title: "", content: "", type: "info" });
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
                <><Send className="w-5 h-5" /> Bütün İstifadəçilərə Göndər</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
