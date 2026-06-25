"use client";

import { useState, useEffect } from "react";
import { History, Search, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminAuditPage() {
  const supabase = createClient();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [adminFilter, setAdminFilter] = useState("all");

  const fetchLogs = async () => {
    setIsLoading(true);
    // Fetch logs, joining with profiles if admin_email wasn't saved natively
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*, profiles(first_name, last_name)")
      .order("created_at", { ascending: false })
      .limit(100); // Last 100 logs
      
    if (data) setLogs(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const BASE_CATEGORIES = [
    "Users",
    "Messages",
    "Broadcast",
    "News",
    "Centers",
    "Team",
    "Programs",
    "Projects",
    "Form Builder",
    "Rooms",
    "Partners",
    "Stats"
  ];
  const dynamicCategories = Array.from(new Set(logs.map(log => log.details?.category).filter(Boolean)));
  const uniqueCategories = Array.from(new Set([...BASE_CATEGORIES, ...dynamicCategories]));
  
  const uniqueAdmins = Array.from(new Set(logs.map(log => log.admin_email).filter(Boolean)));

  const filteredLogs = logs.filter(log => {
    const searchString = `${log.action} ${log.admin_email} ${log.profiles?.first_name} ${log.profiles?.last_name}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || log.details?.category === categoryFilter;
    const matchesAdmin = adminFilter === "all" || log.admin_email === adminFilter;
    
    return matchesSearch && matchesCategory && matchesAdmin;
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <History className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Sistem Tarixçəsi (Audit Logs)</h1>
            <p className="text-muted-foreground mt-1">Adminlərin sistem daxilində etdiyi bütün əməliyyatların xronoloji qeydiyyatı.</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-border bg-muted/20 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Fəaliyyət ilə axtar..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <select
            className="px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="all">Bütün Kateqoriyalar</option>
            {uniqueCategories.map(c => (
              <option key={c as string} value={c as string}>{c as string}</option>
            ))}
          </select>
          <select
            className="px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={adminFilter}
            onChange={e => setAdminFilter(e.target.value)}
          >
            <option value="all">Bütün Adminlər</option>
            {uniqueAdmins.map(a => (
              <option key={a as string} value={a as string}>{a as string}</option>
            ))}
          </select>
        </div>

        {/* Timeline / Table */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">Heç bir tarixçə tapılmadı.</div>
          ) : (
            <div className="relative border-l border-border/60 ml-3 space-y-8 pb-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="relative pl-8">
                  {/* Timeline Dot */}
                  <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background" />
                  
                  <div className="bg-muted/10 border border-border rounded-xl p-4 transition-colors hover:bg-muted/20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-foreground">{log.action}</h4>
                        {log.details?.category && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {log.details.category}
                          </span>
                        )}
                      </div>
                      <time className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                        {new Date(log.created_at).toLocaleString('az-AZ', { 
                          day: '2-digit', month: 'short', year: 'numeric', 
                          hour: '2-digit', minute:'2-digit' 
                        })}
                      </time>
                    </div>
                    
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      İcra edən: 
                      <span className="font-medium text-foreground">
                        {log.profiles?.first_name ? `${log.profiles.first_name} ${log.profiles.last_name}` : (log.admin_email || "Naməlum Admin")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
