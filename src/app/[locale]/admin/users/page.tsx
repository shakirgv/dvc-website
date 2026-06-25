"use client";

import { useState, useEffect } from "react";
import { Search, Download, Shield, ShieldOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/audit-logger";
import { AZERBAIJAN_REGIONS } from "@/lib/regions";

export default function AdminUsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (data) setUsers(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const confirmChange = confirm(`Bu istifadəçinin rolunu '${newRole}' olaraq dəyişmək istədiyinizə əminsiniz?`);
    
    if (confirmChange) {
      const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
      
      if (error) {
        alert("Rol dəyişdirilərkən xəta baş verdi: " + error.message);
      } else {
        alert("Rol uğurla dəyişdirildi.");
        fetchUsers();
        
        // Log the action
        await logAdminAction(`İstifadəçi rolu dəyişdirildi (ID: ${userId}) -> ${newRole}`, "Users");
      }
    }
  };

  const exportToCSV = () => {
    const headers = ["Ad", "Soyad", "Telefon", "Region", "Təhsil", "Rol", "Qeydiyyat Tarixi"];
    const csvContent = [
      headers.join(","),
      ...users.map(u => 
        [
          u.first_name || "-",
          u.last_name || "-",
          u.phone || "-",
          u.region || "-",
          u.education || "-",
          u.role || "user",
          new Date(u.created_at).toLocaleDateString()
        ].map(e => `"${e}"`).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `istifadeciler_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.first_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
                          (u.last_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                          (u.phone || "").includes(searchTerm);
    const matchesRegion = regionFilter === "all" || u.region === regionFilter;
    return matchesSearch && matchesRegion;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">İstifadəçilər</h1>
          <p className="text-muted-foreground mt-1">Sistemdə qeydiyyatdan keçmiş bütün istifadəçilərin idarə edilməsi.</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 hover:bg-green-500/20 font-medium rounded-xl transition-colors"
        >
          <Download className="w-5 h-5" /> CSV Export
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 bg-muted/20">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Ad, Soyad və ya Nömrə ilə axtar..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <select 
            className="px-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={regionFilter}
            onChange={e => setRegionFilter(e.target.value)}
          >
            <option value="all">Bütün Regionlar</option>
            {AZERBAIJAN_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-sm border-b border-border">
                <th className="p-4 font-medium">Ad / Soyad</th>
                <th className="p-4 font-medium">Telefon</th>
                <th className="p-4 font-medium">Region</th>
                <th className="p-4 font-medium">Təhsil</th>
                <th className="p-4 font-medium">Rol</th>
                <th className="p-4 font-medium text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">Heç bir istifadəçi tapılmadı.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium">
                      {user.first_name || "-"} {user.last_name || ""}
                    </td>
                    <td className="p-4 text-muted-foreground">{user.phone || "-"}</td>
                    <td className="p-4">{user.region || "-"}</td>
                    <td className="p-4 text-sm text-muted-foreground">{user.education || "-"}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleRoleChange(user.id, user.role || 'user')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          user.role === 'admin' 
                            ? 'text-orange-600 hover:bg-orange-500/10' 
                            : 'text-primary hover:bg-primary/10'
                        }`}
                      >
                        {user.role === 'admin' ? (
                          <><ShieldOff className="w-4 h-4" /> Adminlikdən Çıxar</>
                        ) : (
                          <><Shield className="w-4 h-4" /> Admin Et</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
