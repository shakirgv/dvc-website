"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Search, Eye, X, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminNewsPage() {
  const [news, setNews] = useState([
    { id: 1, title: "Milli Debat Forumu 2026 Qeydiyyatlarına Start Verildi", date: "15 May 2026", status: "Active", views: 1240 },
    { id: 2, title: "Yeni Süni İntellekt (AI) Debat Modulu İstifadəyə Verildi", date: "10 May 2026", status: "Active", views: 3450 },
    { id: 3, title: "Gənclər Şəbəkəsinin İllik Hesabatı", date: "01 May 2026", status: "Draft", views: 0 },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNews, setCurrentNews] = useState<any>(null);

  const handleDelete = (id: number) => {
    if (confirm("Bu xəbəri silmək istədiyinizə əminsiniz?")) {
      setNews(news.filter(n => n.id !== id));
    }
  };

  const handleEdit = (item: any) => {
    setCurrentNews(item);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setCurrentNews({ id: Date.now(), title: "", date: new Date().toLocaleDateString('az-AZ'), status: "Draft", views: 0 });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (news.find(n => n.id === currentNews.id)) {
      setNews(news.map(n => n.id === currentNews.id ? currentNews : n));
    } else {
      setNews([currentNews, ...news]);
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Xəbərlərin İdarəedilməsi</h1>
          <p className="text-muted-foreground mt-1">Ana səhifədəki xəbərləri əlavə edin, yeniləyin və ya silin.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Xəbər axtar..." 
              className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-hover transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Yeni Xəbər
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Başlıq</th>
              <th className="px-6 py-4 font-medium">Tarix</th>
              <th className="px-6 py-4 font-medium">Baxış</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {news.map((item) => (
              <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4 font-medium max-w-xs truncate">{item.title}</td>
                <td className="px-6 py-4 text-muted-foreground">{item.date}</td>
                <td className="px-6 py-4 text-muted-foreground"><Eye className="w-4 h-4 inline mr-1" /> {item.views}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                    item.status === "Active" ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"
                  }`}>
                    {item.status === "Active" ? "Aktiv" : "Qaralama (Draft)"}
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
          </tbody>
        </table>
      </div>

      {/* CREATE/EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && currentNews && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-2xl font-bold mb-6">{currentNews.title ? "Xəbəri Redaktə Et" : "Yeni Xəbər Yarat"}</h3>
              
              <form onSubmit={handleSave} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-muted-foreground uppercase">Başlıq</label>
                  <input 
                    required type="text" 
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={currentNews.title}
                    onChange={e => setCurrentNews({...currentNews, title: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-muted-foreground uppercase">Şəkil (URL)</label>
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center border border-border shrink-0">
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="https://..."
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-muted-foreground uppercase">Qısa Məzmun</label>
                  <textarea 
                    required rows={3}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-muted-foreground uppercase">Geniş Məzmun (HTML/Markdown dəstəkli)</label>
                  <textarea 
                    rows={6}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm resize-none custom-scrollbar"
                  />
                </div>

                <div className="flex gap-4 items-center">
                  <div className="space-y-1.5 flex-1">
                    <label className="text-sm font-bold text-muted-foreground uppercase">Status</label>
                    <select 
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={currentNews.status}
                      onChange={e => setCurrentNews({...currentNews, status: e.target.value})}
                    >
                      <option value="Active">Aktiv (Saytda Göstər)</option>
                      <option value="Draft">Qaralama (Draft)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <label className="text-sm font-bold text-muted-foreground uppercase">Yazı Tarixi</label>
                    <input 
                      type="text" 
                      className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-muted-foreground"
                      value={currentNews.date}
                      readOnly
                    />
                  </div>
                </div>

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
