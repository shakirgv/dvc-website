"use client";

import { useState, useEffect } from "react";
import { Search, Download, Loader2, FileSpreadsheet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import * as XLSX from "xlsx";
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const exportToCSV = () => {
    const headers = ["DVC ID", "Ad", "Soyad", "E-poçt", "Telefon", "Region", "Təhsil", "Rol", "Qeydiyyat Tarixi"];
    const csvContent = [
      headers.join(","),
      ...filteredUsers.map(u => 
        [
          u.dvc_id || "-",
          u.first_name || "-",
          u.last_name || "-",
          u.email || "-",
          u.phone || "-",
          u.region || "-",
          u.education || "-",
          u.role || "user",
          formatDateTime(u.created_at)
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

  const exportToExcel = () => {
    const headers = ["DVC ID", "Ad", "Soyad", "E-poçt", "Telefon", "Region", "Təhsil", "Rol", "Qeydiyyat Tarixi"];
    const excelData = filteredUsers.map(u => ({
      "DVC ID": u.dvc_id || "-",
      "Ad": u.first_name || "-",
      "Soyad": u.last_name || "-",
      "E-poçt": u.email || "-",
      "Telefon": u.phone || "-",
      "Region": u.region || "-",
      "Təhsil": u.education || "-",
      "Rol": u.role || "user",
      "Qeydiyyat Tarixi": formatDateTime(u.created_at)
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "İstifadəçilər");
    
    // Generate buffer
    XLSX.writeFile(workbook, `istifadeciler_${new Date().toLocaleDateString()}.xlsx`);
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
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 hover:bg-green-500/20 font-medium rounded-xl transition-colors"
          >
            <Download className="w-5 h-5" /> CSV
          </button>
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 font-medium rounded-xl transition-colors"
          >
            <FileSpreadsheet className="w-5 h-5" /> Excel
          </button>
        </div>
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
                <th className="p-4 font-medium">DVC ID</th>
                <th className="p-4 font-medium">Ad / Soyad</th>
                <th className="p-4 font-medium">E-poçt</th>
                <th className="p-4 font-medium">Telefon</th>
                <th className="p-4 font-medium">Region</th>
                <th className="p-4 font-medium">Təhsil</th>
                <th className="p-4 font-medium">Rol</th>
                <th className="p-4 font-medium">Qeydiyyat Tarixi</th>
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
                    <td className="p-4 font-mono font-medium text-primary">{user.dvc_id || "-"}</td>
                    <td className="p-4 font-medium">
                      {user.first_name || "-"} {user.last_name || ""}
                    </td>
                    <td className="p-4 text-muted-foreground">{user.email || "-"}</td>
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
                    <td className="p-4 text-sm text-muted-foreground">{formatDateTime(user.created_at)}</td>
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
