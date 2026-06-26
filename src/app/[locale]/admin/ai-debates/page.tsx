"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, Database, TrendingUp, Flag, Download, Eye, FileText, X, AlertTriangle, 
  CheckCircle2, Loader2, ArrowLeft, RefreshCw
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

export default function AdminAIDebatesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [debates, setDebates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Stats
  const [totalDebates, setTotalDebates] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [trendingTopics, setTrendingTopics] = useState<any[]>([]);

  // Modal
  const [selectedDebate, setSelectedDebate] = useState<any | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    
    const { data: debatesData, error } = await supabase
      .from("ai_debates")
      .select("*, profiles(first_name, last_name, dvc_id)")
      .order("created_at", { ascending: false });

    if (debatesData) {
      setDebates(debatesData);
      setTotalDebates(debatesData.length);
      
      const tokens = debatesData.reduce((acc, curr) => acc + (curr.total_tokens || 0), 0);
      setTotalTokens(tokens);

      // Simple Topic Extraction for Trending
      const topicCounts: Record<string, number> = {};
      debatesData.forEach((d) => {
        const t = d.topic?.toLowerCase().trim();
        if (t) {
          topicCounts[t] = (topicCounts[t] || 0) + 1;
        }
      });
      const trending = Object.entries(topicCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([topic, count]) => ({ topic, count }));
      setTrendingTopics(trending);
    }
    
    setIsLoading(false);
  };

  const handleFlagToggle = async (id: string, currentFlag: boolean) => {
    const { error } = await supabase
      .from("ai_debates")
      .update({ is_flagged: !currentFlag })
      .eq("id", id);
      
    if (!error) {
      fetchData(); // refresh data
    } else {
      alert("Xəta baş verdi");
    }
  };

  const exportToExcel = () => {
    const excelData = debates.map((d) => ({
      "Ad/Soyad": `${d.profiles?.first_name || ""} ${d.profiles?.last_name || ""}`.trim(),
      "DVC ID": d.profiles?.dvc_id || "",
      "Debat Mövzusu": d.topic,
      "Seçdiyi Tərəf": d.side,
      "Yekun Xal": d.score,
      "Tarix": new Date(d.created_at).toLocaleString("az-AZ"),
      "Status": d.is_flagged ? "Şübhəli/Silinmiş" : "Təsdiqlənib",
      "Xərclənən Token": d.total_tokens || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AI Debatlar");
    XLSX.writeFile(workbook, `AI_Debatlar_Hesabati_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const filteredDebates = debates.filter((d) => {
    const name = `${d.profiles?.first_name || ""} ${d.profiles?.last_name || ""}`.toLowerCase();
    const dvc = d.profiles?.dvc_id?.toLowerCase() || "";
    return name.includes(searchTerm.toLowerCase()) || dvc.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/admin')}
              className="p-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bot className="w-6 h-6 text-primary" /> AI Debat İdarəetməsi
              </h1>
              <p className="text-muted-foreground text-sm">Debat xronologiyası, statistika və token xərcləri</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={fetchData} 
              className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Yenilə
            </button>
            <button 
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" /> Excel-ə Çıxart
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-full text-primary shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Ümumi Debat Sayı</p>
              <h3 className="text-3xl font-black">{totalDebates}</h3>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-purple-500/10 rounded-full text-purple-500 shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Sərf Olunan Token (Gemini)</p>
              <h3 className="text-3xl font-black">{totalTokens.toLocaleString()}</h3>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h4 className="text-sm font-bold flex items-center gap-2 mb-3 text-muted-foreground">
              <TrendingUp className="w-4 h-4" /> Top Trend Mövzular
            </h4>
            <div className="space-y-2">
              {trendingTopics.map((t, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="truncate pr-4 max-w-[200px] font-medium" title={t.topic}>{t.topic}</span>
                  <span className="bg-muted px-2 py-0.5 rounded-md text-xs font-bold">{t.count}x</span>
                </div>
              ))}
              {trendingTopics.length === 0 && <p className="text-xs text-muted-foreground">Məlumat yoxdur</p>}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border flex justify-between items-center bg-muted/30">
            <h3 className="font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Sessiya Tarixçəsi
            </h3>
            <input 
              type="text" 
              placeholder="İstifadəçi və DVC ID axtar..." 
              className="px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-5 py-4 font-bold">İstifadəçi</th>
                  <th className="px-5 py-4 font-bold">Mövzu / Tərəf</th>
                  <th className="px-5 py-4 font-bold">Xal</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 font-bold text-right">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Yüklənir...
                    </td>
                  </tr>
                ) : filteredDebates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">Məlumat tapılmadı</td>
                  </tr>
                ) : (
                  filteredDebates.map((d) => (
                    <tr key={d.id} className={`border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${d.is_flagged ? 'bg-red-500/5 hover:bg-red-500/10' : ''}`}>
                      <td className="px-5 py-4">
                        <div className="font-bold">{d.profiles?.first_name} {d.profiles?.last_name}</div>
                        <div className="text-xs text-muted-foreground">{d.profiles?.dvc_id}</div>
                        <div className="text-xs text-muted-foreground mt-1">{new Date(d.created_at).toLocaleString("az-AZ", {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'})}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold line-clamp-2" title={d.topic}>{d.topic}</div>
                        <div className="text-xs mt-1 bg-primary/10 text-primary w-fit px-2 py-0.5 rounded font-bold">{d.side}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-black text-lg">{d.score}</span>/100
                      </td>
                      <td className="px-5 py-4">
                        {d.is_flagged ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-600 rounded text-xs font-bold">
                            <AlertTriangle className="w-3 h-3" /> Bloklanıb
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-600 rounded text-xs font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Keçərli
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setSelectedDebate(d)}
                            className="p-2 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 rounded-lg transition-colors"
                            title="Logları Oxu"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleFlagToggle(d.id, d.is_flagged)}
                            className={`p-2 rounded-lg transition-colors ${d.is_flagged ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' : 'bg-red-500/10 text-red-600 hover:bg-red-500/20'}`}
                            title={d.is_flagged ? "Bloku Aç" : "Sessiyanı Blokla"}
                          >
                            <Flag className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Log Modal */}
      <AnimatePresence>
        {selectedDebate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedDebate(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-card border border-border w-full max-w-3xl rounded-2xl shadow-xl z-10 flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-border flex justify-between items-center sticky top-0 bg-card rounded-t-2xl z-10">
                <div>
                  <h3 className="font-bold text-lg">Sessiya Logları</h3>
                  <p className="text-xs text-muted-foreground">{selectedDebate.profiles?.first_name} {selectedDebate.profiles?.last_name} • Token: {selectedDebate.total_tokens}</p>
                </div>
                <button onClick={() => setSelectedDebate(null)} className="p-2 bg-muted hover:bg-border rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                
                {/* Chat History */}
                <div>
                  <h4 className="font-bold mb-4 flex items-center gap-2"><Bot className="w-4 h-4" /> Chat Tarixçəsi</h4>
                  <div className="space-y-4">
                    {selectedDebate.chat_history ? (
                      selectedDebate.chat_history.map((msg: any, i: number) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-2xl p-4 text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'}`}>
                            <div className="text-xs opacity-70 mb-1 font-bold">{msg.role === 'user' ? 'Gənc' : 'Süni İntellekt'}</div>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Bu sessiyanın chat logları yoxdur.</p>
                    )}
                  </div>
                </div>

                {/* Final Feedback */}
                <div className="bg-primary/5 rounded-xl p-5 border border-primary/20">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Yekun Hakim Rəyi</h4>
                    <div className="font-black text-xl text-primary">{selectedDebate.score} / 100</div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedDebate.feedback}</p>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
