"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Library, X, Upload, Video, FileText, Link as LinkIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/audit-logger";

interface ResourceItem {
  id: string;
  title: string;
  type: 'video' | 'file' | 'link';
  file_url: string;
  file_size?: string;
  video_duration?: string;
  target_user_ids: string[] | null;
  created_at: string;
}

export default function AdminResourcesPage() {
  const supabase = createClient();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<ResourceItem>>({
    title: "",
    type: "file",
    file_url: "",
    file_size: "",
    video_duration: "",
  });
  const [targetType, setTargetType] = useState("all");
  const [targetInput, setTargetInput] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (data) {
      setResources(data);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm("Bu resursu silmək istədiyinizə əminsiniz?")) {
      const { error } = await supabase.from("resources").delete().eq("id", id);
      if (!error) {
        setResources(resources.filter(r => r.id !== id));
        await logAdminAction(`Resurs silindi: "${title}"`, "Resources");
      }
    }
  };

  const handleCreate = () => {
    setFormData({
      title: "",
      type: "file",
      file_url: "",
      file_size: "",
      video_duration: "",
    });
    setTargetType("all");
    setTargetInput("");
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingFile(true);
    
    // Calculate size
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    setFormData(prev => ({ ...prev, file_size: `${sizeMB} MB` }));

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `resources/${fileName}`;

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
      setFormData(prev => ({ ...prev, file_url: data.publicUrl }));
    }
    setUploadingFile(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.file_url) {
      return alert("Başlıq və Fayl/URL mütləqdir.");
    }

    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    // Determine target users
    let target_user_ids: string[] | null = null;
    
    if (targetType !== "all" && targetInput.trim()) {
      const inputs = targetInput.split(/[\n,]+/).map(i => i.trim()).filter(i => i);
      
      if (inputs.length > 0) {
        const column = targetType === "dvc_id" ? "dvc_id" : "email";
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("id")
          .in(column, inputs);
          
        if (usersError || !usersData || usersData.length === 0) {
          alert("Göstərilən hədəf üzrə istifadəçi tapılmadı.");
          setIsSaving(false);
          return;
        }
        target_user_ids = usersData.map(u => u.id);
      }
    }

    const payload = {
      ...formData,
      target_user_ids,
      created_by: user?.id
    };

    const { data, error } = await supabase
      .from("resources")
      .insert([payload])
      .select();

    if (error) {
      alert("Xəta baş verdi: " + error.message);
      setIsSaving(false);
      return;
    }

    // Send Notification
    const notifPayload = {
      title: "Yeni Resurs",
      content: `Sizin yeni resursunuz mövcuddur. Nəzərdən keçirmək üçün resurslar bölməsini yoxlayın.`,
      type: "info",
      created_by: user?.id,
      target_user_ids: target_user_ids,
      action_url: "/az/dashboard",
      action_text: "Resurslara Bax"
    };
    await supabase.from("notifications").insert(notifPayload);

    await logAdminAction(`Yeni resurs əlavə edildi: "${formData.title}"`, "Resources");

    if (data && data.length > 0) {
      setResources([data[0], ...resources]);
    }
    
    setIsSaving(false);
    setIsModalOpen(false);
    alert("Resurs uğurla əlavə edildi!");
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"><Library className="w-8 h-8 text-primary" /> Resursların İdarəedilməsi</h1>
          <p className="text-muted-foreground mt-1">İstifadəçilər üçün video, fayl və link resurslarını sistemə yükləyin.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-hover transition-colors whitespace-nowrap"
        >
          <Plus className="w-5 h-5" /> Yeni Resurs
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm min-h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Yüklənir...</div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Növ</th>
                <th className="px-6 py-4 font-medium">Başlıq</th>
                <th className="px-6 py-4 font-medium">Ölçü/Müddət</th>
                <th className="px-6 py-4 font-medium">Hədəf</th>
                <th className="px-6 py-4 font-medium text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {resources.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    {item.type === 'video' && <span className="flex items-center gap-2 text-purple-500 font-medium"><Video className="w-4 h-4" /> Video</span>}
                    {item.type === 'file' && <span className="flex items-center gap-2 text-blue-500 font-medium"><FileText className="w-4 h-4" /> Fayl</span>}
                    {item.type === 'link' && <span className="flex items-center gap-2 text-green-500 font-medium"><LinkIcon className="w-4 h-4" /> Link</span>}
                  </td>
                  <td className="px-6 py-4 font-medium max-w-[200px] truncate">{item.title}</td>
                  <td className="px-6 py-4 text-muted-foreground text-xs">
                    {item.type === 'video' ? (item.video_duration || 'N/A') : (item.file_size || 'N/A')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 bg-muted rounded-md text-xs font-medium">
                      {item.target_user_ids ? `${item.target_user_ids.length} istifadəçi` : 'Qlobal'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleDelete(item.id, item.title)} className="p-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-xl transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {resources.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Heç bir resurs tapılmadı.
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
              
              <h3 className="text-2xl font-bold mb-6">Yeni Resurs Yarat</h3>
              
              <form onSubmit={handleSave} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-muted-foreground uppercase">Resursun Adı</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Məsələn: Debatın Əsasları 1"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-muted-foreground uppercase">Tipi</label>
                    <select 
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value as any})}
                    >
                      <option value="video">Video (MP4)</option>
                      <option value="file">Fayl (PDF/Doc)</option>
                      <option value="link">Xarici Link</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 bg-muted/20 p-4 rounded-2xl border border-border">
                  <label className="text-sm font-bold text-muted-foreground uppercase flex items-center justify-between">
                    <span>{formData.type === 'link' ? 'Xarici URL' : 'Fayl Yüklə / URL'}</span>
                    {uploadingFile && <span className="text-xs text-primary animate-pulse flex items-center"><Loader2 className="w-3 h-3 animate-spin mr-1"/> Yüklənir...</span>}
                  </label>
                  
                  <div className="flex gap-2">
                    <input 
                      required
                      type={formData.type === 'link' ? "url" : "text"}
                      placeholder="https://..."
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={formData.file_url}
                      onChange={e => setFormData({...formData, file_url: e.target.value})}
                    />
                    
                    {formData.type !== 'link' && (
                      <label className="flex items-center justify-center px-4 py-2 bg-primary/10 text-primary font-bold rounded-xl cursor-pointer hover:bg-primary/20 transition-colors shrink-0">
                        <Upload className="w-5 h-5 mr-2" />
                        Seç
                        <input 
                          type="file" 
                          accept={formData.type === 'video' ? "video/*" : ".pdf,.doc,.docx"}
                          className="hidden" 
                          onChange={handleFileUpload}
                          disabled={uploadingFile}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(formData.type === 'file' || formData.type === 'video') && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-muted-foreground uppercase">Fayl Həcmi</label>
                      <input 
                        type="text" 
                        placeholder="Məsələn: 2.4 MB"
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={formData.file_size}
                        onChange={e => setFormData({...formData, file_size: e.target.value})}
                      />
                    </div>
                  )}

                  {formData.type === 'video' && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-muted-foreground uppercase">Video Müddəti (Dəqiqə)</label>
                      <input 
                        type="text" 
                        placeholder="Məsələn: 15 dəqiqə"
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={formData.video_duration}
                        onChange={e => setFormData({...formData, video_duration: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wide">Hədəf Kütlə</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Ünvanlanır</label>
                      <select 
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={targetType}
                        onChange={e => setTargetType(e.target.value)}
                      >
                        <option value="all">Bütün İstifadəçilərə (Qlobal)</option>
                        <option value="dvc_id">DVC ID ilə (Fərdi/Çoxlu)</option>
                        <option value="email">E-poçt ilə (Fərdi/Çoxlu)</option>
                      </select>
                    </div>

                    {targetType !== "all" && (
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">ID-lər / E-poçtlar (Vergüllə ayırın)</label>
                        <input 
                          type="text" 
                          placeholder="Məs: DVC-12345, DVC-98765"
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
                          value={targetInput}
                          onChange={e => setTargetInput(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80 transition-colors">Ləğv et</button>
                  <button type="submit" disabled={isSaving || uploadingFile} className="flex-[2] py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-colors shadow-md disabled:opacity-50 flex items-center justify-center">
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Resursu Yarat"}
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
