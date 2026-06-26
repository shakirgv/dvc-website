"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Award, X, Upload, Loader2, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/audit-logger";

interface CertificateItem {
  id: string;
  cert_id: string;
  user_id: string;
  type: string;
  program_name: string;
  pdf_url: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    dvc_id: string;
  };
}

export default function AdminCertificatesPage() {
  const supabase = createClient();
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    type: "participation",
    program_name: "",
    pdf_url: "",
  });
  const [targetType, setTargetType] = useState("dvc_id");
  const [targetInput, setTargetInput] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("certificates")
      .select("*, profiles(first_name, last_name, dvc_id)")
      .order("created_at", { ascending: false });
      
    if (data) {
      setCertificates(data);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string, certId: string) => {
    if (confirm(`Bu sertifikatı (${certId}) silmək istədiyinizə əminsiniz?`)) {
      const { error } = await supabase.from("certificates").delete().eq("id", id);
      if (!error) {
        setCertificates(certificates.filter(c => c.id !== id));
        await logAdminAction(`Sertifikat silindi: ${certId}`, "Certificates");
      }
    }
  };

  const handleCreate = () => {
    setFormData({
      type: "participation",
      program_name: "",
      pdf_url: "",
    });
    setTargetType("dvc_id");
    setTargetInput("");
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingFile(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `certificates/${fileName}`;

    // Upload to dvc_images
    const { error: uploadError } = await supabase.storage
      .from("dvc_images")
      .upload(filePath, file);

    if (uploadError) {
      alert("Fayl yüklənərkən xəta baş verdi: " + uploadError.message);
      setUploadingFile(false);
      return;
    }

    const { data } = supabase.storage.from("dvc_images").getPublicUrl(filePath);
    if (data?.publicUrl) {
      setFormData(prev => ({ ...prev, pdf_url: data.publicUrl }));
    }
    setUploadingFile(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.program_name || !formData.pdf_url || !targetInput) {
      return alert("Bütün xanaları doldurun və PDF yükləyin.");
    }

    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    // Determine target user
    const column = targetType === "dvc_id" ? "dvc_id" : "email";
    const { data: usersData, error: usersError } = await supabase
      .from("profiles")
      .select("id")
      .eq(column, targetInput.trim())
      .single();
      
    if (usersError || !usersData) {
      alert("Göstərilən hədəf üzrə istifadəçi tapılmadı.");
      setIsSaving(false);
      return;
    }
    const targetUserId = usersData.id;

    // Generate CERT ID
    const currentYear = new Date().getFullYear();
    const prefix = `CERT-${currentYear}-`;
    
    const { count } = await supabase
      .from("certificates")
      .select("*", { count: 'exact', head: true })
      .like("cert_id", `${prefix}%`);
      
    const nextNumber = (count || 0) + 1;
    const certId = `${prefix}${String(nextNumber).padStart(4, '0')}`;

    const payload = {
      cert_id: certId,
      user_id: targetUserId,
      type: formData.type,
      program_name: formData.program_name,
      pdf_url: formData.pdf_url
    };

    const { data, error } = await supabase
      .from("certificates")
      .insert([payload])
      .select("*, profiles(first_name, last_name, dvc_id)");

    if (error) {
      alert("Xəta baş verdi: " + error.message);
      setIsSaving(false);
      return;
    }

    // Send Notification
    const notifPayload = {
      title: "Yeni Sertifikat",
      content: `Sizin yeni sertifikatınız mövcuddur. Nəzərdən keçirmək üçün Sertifikatlar bölməsini yoxlayın.`,
      type: "success",
      created_by: user?.id,
      target_user_ids: [targetUserId],
      action_url: "/az/dashboard",
      action_text: "Sertifikatlara Bax"
    };
    await supabase.from("notifications").insert(notifPayload);

    await logAdminAction(`Yeni sertifikat verildi: ${certId}`, "Certificates");

    if (data && data.length > 0) {
      setCertificates([data[0], ...certificates]);
    }
    
    setIsSaving(false);
    setIsModalOpen(false);
    alert("Sertifikat uğurla əlavə edildi!");
  };

  const getTypeLabel = (type: string) => {
    if (type === 'participation') return 'İştirakçı Sertifikatı';
    if (type === 'organization') return 'Təşkilatçı Sertifikatı';
    return 'Fəxri Qonaq Sertifikatı';
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"><Award className="w-8 h-8 text-primary" /> Sertifikatların İdarəedilməsi</h1>
          <p className="text-muted-foreground mt-1">İştirakçı, təşkilatçı və fəxri qonaqlara sertifikatların verilməsi.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-hover transition-colors whitespace-nowrap"
        >
          <Plus className="w-5 h-5" /> Yeni Sertifikat Yarat
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm min-h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Yüklənir...</div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Sertifikat ID</th>
                <th className="px-6 py-4 font-medium">Sahibi</th>
                <th className="px-6 py-4 font-medium">Növü</th>
                <th className="px-6 py-4 font-medium">Proqram</th>
                <th className="px-6 py-4 font-medium">Tarix</th>
                <th className="px-6 py-4 font-medium text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {certificates.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-primary">{item.cert_id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{item.profiles?.first_name} {item.profiles?.last_name}</div>
                    <div className="text-xs text-muted-foreground">{item.profiles?.dvc_id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 bg-muted rounded-md text-xs font-medium">
                      {getTypeLabel(item.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-[200px] truncate">{item.program_name}</td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">
                    {new Date(item.created_at).toLocaleDateString("az-AZ")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <a href={item.pdf_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 rounded-xl transition-colors">
                        <FileText className="w-4 h-4" />
                      </a>
                      <button onClick={() => handleDelete(item.id, item.cert_id)} className="p-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-xl transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {certificates.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Heç bir sertifikat tapılmadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-2xl font-bold mb-6">Yeni Sertifikat Yarat</h3>
              
              <form onSubmit={handleSave} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-muted-foreground uppercase">Hədəf Növü</label>
                    <select 
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={targetType}
                      onChange={e => setTargetType(e.target.value)}
                    >
                      <option value="dvc_id">DVC ID</option>
                      <option value="email">E-poçt</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-muted-foreground uppercase">{targetType === 'dvc_id' ? 'DVC ID Daxil Edin' : 'E-poçt Daxil Edin'}</label>
                    <input 
                      required
                      type="text" 
                      placeholder={targetType === 'dvc_id' ? "Məs: DVC-12345" : "Məs: test@example.com"}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
                      value={targetInput}
                      onChange={e => setTargetInput(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-muted-foreground uppercase">Sertifikatın Növü</label>
                    <select 
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="participation">İştirakçı Sertifikatı</option>
                      <option value="organization">Təşkilatçı Sertifikatı</option>
                      <option value="honorary_guest">Fəxri Qonaq Sertifikatı</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-muted-foreground uppercase">Proqramın Adı</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Məsələn: Gənclər Şəbəkəsi Forumu 2026"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={formData.program_name}
                      onChange={e => setFormData({...formData, program_name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 bg-muted/20 p-4 rounded-2xl border border-border">
                  <label className="text-sm font-bold text-muted-foreground uppercase flex items-center justify-between">
                    <span>PDF Sertifikat Yüklə</span>
                    {uploadingFile && <span className="text-xs text-primary animate-pulse flex items-center"><Loader2 className="w-3 h-3 animate-spin mr-1"/> Yüklənir...</span>}
                  </label>
                  
                  <div className="flex gap-2">
                    <input 
                      required
                      type="text"
                      placeholder="URL avtomatik görünəcək"
                      readOnly
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 opacity-70"
                      value={formData.pdf_url}
                    />
                    
                    <label className="flex items-center justify-center px-4 py-2 bg-primary/10 text-primary font-bold rounded-xl cursor-pointer hover:bg-primary/20 transition-colors shrink-0">
                      <Upload className="w-5 h-5 mr-2" />
                      Seç
                      <input 
                        type="file" 
                        accept=".pdf"
                        className="hidden" 
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80 transition-colors">Ləğv et</button>
                  <button type="submit" disabled={isSaving || uploadingFile} className="flex-[2] py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-colors shadow-md disabled:opacity-50 flex items-center justify-center">
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sertifikatı Yarat"}
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
