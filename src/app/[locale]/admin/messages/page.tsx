"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, CheckCircle2, Circle, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/audit-logger";

export default function AdminMessagesPage() {
  const supabase = createClient();
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const SUBJECTS = [
    "Proqramlar və layihələr barədə",
    "Debat klubları və mərkəzlər barədə",
    "Tərəfdaşlıq təklifi",
    "Texniki dəstək",
    "Təklif və iradlar",
    "Digər"
  ];

  const fetchMessages = async () => {
    setIsLoading(true);
    const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    if (data) setMessages(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleStatusChange = async (id: string, currentStatus: string, senderName: string) => {
    if (currentStatus === "resolved") return; // Already resolved
    
    const confirmChange = confirm("Bu mesajı cavablandırıldı kimi işarələmək istədiyinizə əminsiniz?");
    if (confirmChange) {
      const { error } = await supabase.from("contact_messages").update({ status: 'resolved' }).eq("id", id);
      
      if (error) {
        alert("Status dəyişdirilərkən xəta baş verdi: " + error.message);
      } else {
        fetchMessages();
        
        // Log the action
        const { data: { session } } = await supabase.auth.getSession();
        const userEmail = session?.user?.email || "Admin";
        await logAdminAction(`${userEmail} əlaqə mesajını cavablandırdı (ID: #${id.substring(0,6)}, Göndərən: ${senderName})`, "Messages");
      }
    }
  };

  const filteredMessages = messages.filter(m => {
    const matchesSearch = (m.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
                          (m.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                          (m.phone_number?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                          (m.message?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    const matchesSubject = subjectFilter === "all" || m.subject === subjectFilter;
    return matchesSearch && matchesStatus && matchesSubject;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3"><Mail className="w-8 h-8 text-primary" /> Gələn Mesajlar</h1>
          <p className="text-muted-foreground mt-1">Bizimlə Əlaqə formundan göndərilən mesajların idarə edilməsi.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 bg-muted/20">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Ad, E-poçt, Nömrə və ya Mesaj mətni ilə axtar..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <select 
            className="px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">Bütün Statuslar</option>
            <option value="pending">Gözləyir (Cavablanmamış)</option>
            <option value="resolved">Cavablandırıldı</option>
          </select>
          <select 
            className="px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 max-w-xs truncate"
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
          >
            <option value="all">Bütün Mövzular</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* List */}
        <div className="divide-y divide-border">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              Mesaj tapılmadı.
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div key={msg.id} className={`p-6 transition-colors ${msg.status === 'pending' ? 'bg-primary/5' : 'bg-card hover:bg-muted/30'}`}>
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-bold text-lg">{msg.full_name}</h3>
                      <a href={`mailto:${msg.email}`} className="text-sm text-primary hover:underline">{msg.email}</a>
                      {msg.phone_number && <span className="text-sm text-muted-foreground">• {msg.phone_number}</span>}
                      <span className="text-xs text-muted-foreground">• {new Date(msg.created_at).toLocaleString('az-AZ')}</span>
                    </div>
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground mb-3">
                      Mövzu: {msg.subject}
                    </div>
                    <p className="text-foreground/90 whitespace-pre-wrap">{msg.message}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold ${
                      msg.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-green-500/10 text-green-600'
                    }`}>
                      {msg.status === 'pending' ? <Circle className="w-4 h-4 fill-current" /> : <CheckCircle2 className="w-4 h-4" />}
                      {msg.status === 'pending' ? 'Cavab gözləyir' : 'Cavablandırıldı'}
                    </div>
                    
                    {msg.status === 'pending' && (
                      <button 
                        onClick={() => handleStatusChange(msg.id, msg.status, msg.full_name)}
                        className="mt-2 text-sm font-medium text-primary hover:underline"
                      >
                        Həll olundu kimi işarələ
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
