"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Search, Eye, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function AdminProjectsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any>(null);

  // Load from local storage to sync with the user's dashboard
  useEffect(() => {
    const fetchApps = () => {
      const sessionData = localStorage.getItem("dvc-mock-session");
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        if (parsed.applications) {
          // We attach the mock user info to the apps for admin view
          const appsWithUser = parsed.applications.map((app: any) => ({
            ...app,
            userId: parsed.id,
            userName: `${parsed.firstName} ${parsed.lastName}`,
            userEmail: parsed.email
          }));
          setApplications(appsWithUser);
        }
      }
    };
    
    fetchApps();
    // Listen for storage changes if in another tab
    window.addEventListener('storage', fetchApps);
    return () => window.removeEventListener('storage', fetchApps);
  }, []);

  const handleStatusChange = (appId: number, newStatus: "Approved" | "Rejected") => {
    const updatedApps = applications.map(app => 
      app.id === appId ? { ...app, status: newStatus } : app
    );
    setApplications(updatedApps);

    // Sync back to local storage (Simulating DB update)
    const sessionData = localStorage.getItem("dvc-mock-session");
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      const userApps = parsed.applications.map((app: any) => 
        app.id === appId ? { ...app, status: newStatus } : app
      );
      parsed.applications = userApps;
      localStorage.setItem("dvc-mock-session", JSON.stringify(parsed));
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Müraciətlərin İdarəedilməsi</h1>
          <p className="text-muted-foreground mt-1">Layihələrə gələn müraciətləri yoxlayın və qərar verin.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Müraciətçi və ya layihə axtar..." 
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Müraciətçi</th>
                <th className="px-6 py-4 font-medium">Layihə</th>
                <th className="px-6 py-4 font-medium">Tarix</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    Hələlik heç bir müraciət tapılmadı. (İstifadəçi panelindən test üçün yeni müraciət yaradın)
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{app.userName}</div>
                      <div className="text-xs text-muted-foreground">{app.userId}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">{app.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{app.date}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        app.status === "Pending" ? "bg-yellow-500/10 text-yellow-600" :
                        app.status === "Approved" ? "bg-green-500/10 text-green-600" :
                        "bg-red-500/10 text-red-600"
                      }`}>
                        {app.status === "Pending" && "Gözləyir"}
                        {app.status === "Approved" && "Təsdiqləndi"}
                        {app.status === "Rejected" && "İmtina"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedApp(app)}
                          className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Ətraflı Bax"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {app.status === "Pending" && (
                          <>
                            <button 
                              onClick={() => handleStatusChange(app.id, "Approved")}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-600 hover:bg-green-500 text-xs font-bold rounded-lg transition-all hover:text-white"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Təsdiqlə
                            </button>
                            <button 
                              onClick={() => handleStatusChange(app.id, "Rejected")}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-600 hover:bg-red-500 text-xs font-bold rounded-lg transition-all hover:text-white"
                            >
                              <XCircle className="w-3.5 h-3.5" /> İmtina et
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW MODAL */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl p-6 relative"
            >
              <button onClick={() => setSelectedApp(null)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-xl font-bold mb-1">Müraciət Detalları</h3>
              <p className="text-muted-foreground text-sm mb-6">{selectedApp.name}</p>
              
              <div className="space-y-4 mb-8">
                <div className="p-4 bg-muted/30 rounded-xl border border-border">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">İştirakçı</h4>
                  <p className="font-medium">{selectedApp.userName}</p>
                  <p className="text-sm text-muted-foreground">{selectedApp.userEmail}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase">Form Cavabları</h4>
                  {selectedApp.responses ? (
                    Object.entries(selectedApp.responses).map(([key, val]: any) => (
                      <div key={key} className="p-3 bg-card border border-border rounded-lg">
                        <span className="text-xs text-muted-foreground block mb-1">Sual ID: {key}</span>
                        <p className="font-medium text-sm">{val}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Bu müraciətdə cavablandırılmış form yoxdur.</p>
                  )}
                </div>
              </div>

              {selectedApp.status === "Pending" && (
                <div className="flex gap-3 pt-4 border-t border-border">
                  <button 
                    onClick={() => { handleStatusChange(selectedApp.id, "Approved"); setSelectedApp(null); }}
                    className="flex-1 bg-green-500 text-white rounded-xl py-3 font-semibold hover:bg-green-600 transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" /> Təsdiqlə
                  </button>
                  <button 
                    onClick={() => { handleStatusChange(selectedApp.id, "Rejected"); setSelectedApp(null); }}
                    className="flex-1 bg-red-500 text-white rounded-xl py-3 font-semibold hover:bg-red-600 transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" /> İmtina et
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
