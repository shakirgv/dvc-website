"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { LogOut, User, FileText, PlayCircle, Award, CheckCircle2, Clock, Edit2, Camera, Plus, X, BookOpen, File as FileIcon, Bot, Zap, Users, Trophy, QrCode, History, Loader2, AlertCircle, Bell, Info, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n-context";
import { AZERBAIJAN_REGIONS } from "@/lib/regions";

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  
  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Applications State
  const [applications, setApplications] = useState<any[]>([]);
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [selectedProjectForApp, setSelectedProjectForApp] = useState<any>(null);
  const [applicationFormData, setApplicationFormData] = useState<any>({});

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);

  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState({ phone: "+994 ", region: "Bakı", education: "", password: "", confirmPassword: "" });
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(false);
  
  // Password Update State
  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setSession(session);
      
      // Fetch profile from public.profiles table
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      
      if (profile) {
        setProfileData({
          firstName: profile.first_name || session.user.user_metadata.first_name || session.user.user_metadata.name || "",
          lastName: profile.last_name || session.user.user_metadata.last_name || "",
          phone: profile.phone || "",
          region: profile.region || "",
          education: profile.education || "",
          avatar: profile.avatar_url || session.user.user_metadata.avatar_url || null
        });

        if (!profile.phone || !profile.region) {
          setShowOnboarding(true);
        }
      } else {
        // If profile doesn't exist yet (maybe trigger failed or Google login), show onboarding
        setShowOnboarding(true);
      }
      
      fetchData(session.user.id);
    };

    checkSession();
  }, [router]);

  const fetchData = async (userId: string) => {
    setIsLoadingApps(true);
    // Fetch active projects
    const { data: projData } = await supabase.from("projects").select("*").eq("status", "Active");
    if (projData) setActiveProjects(projData);

    // Fetch user applications
    const { data: appData } = await supabase.from("applications").select(`*, projects(title_az)`).eq("user_id", userId).order("created_at", { ascending: false });
    if (appData) {
      setApplications(appData.map(a => ({
        id: a.id,
        name: a.projects?.title_az || "Layihə",
        project_id: a.project_id,
        date: new Date(a.created_at).toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' }),
        status: a.status
      })));
    }

    // Fetch Notifications
    const { data: notifs } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(5);
    if (notifs) setNotifications(notifs);

    setIsLoadingApps(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const saveProfile = async () => {
    const updates = {
      id: session.user.id,
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      phone: profileData.phone,
      region: profileData.region,
      education: profileData.education,
      avatar_url: profileData.avatar,
    };
    const { error } = await supabase.from("profiles").upsert(updates);
    if (error) {
      alert("Profil yadda saxlanılarkən xəta baş verdi: " + error.message);
      return;
    }
    alert("Profiliniz uğurla yeniləndi!");
    setIsEditingProfile(false);
  };

  const saveOnboarding = async () => {
    if (onboardingData.phone.length < 19) return alert("Zəhmət olmasa telefon nömrəsini tam daxil edin.");
    if (onboardingData.password.length > 0 && onboardingData.password.length < 6) return alert("Şifrə minimum 6 simvol olmalıdır.");
    if (onboardingData.password !== onboardingData.confirmPassword) return alert("Şifrələr uyğun gəlmir.");
    
    setIsOnboardingLoading(true);
    const updates = {
      id: session?.user?.id,
      first_name: session?.user?.user_metadata?.full_name?.split(" ")[0] || session?.user?.user_metadata?.name || "",
      last_name: session?.user?.user_metadata?.full_name?.split(" ").slice(1).join(" ") || "",
      phone: onboardingData.phone,
      region: onboardingData.region,
      education: onboardingData.education,
    };
    await supabase.from("profiles").upsert(updates);
    
    // Update password if provided
    if (onboardingData.password) {
      const { error } = await supabase.auth.updateUser({ password: onboardingData.password });
      if (error) {
        alert("Şifrə təyin edilərkən xəta: " + error.message);
      }
    }

    setProfileData((prev: any) => ({ ...prev, ...updates, firstName: updates.first_name, lastName: updates.last_name }));
    setIsOnboardingLoading(false);
    setShowOnboarding(false);
  };

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword.length < 6) return alert("Şifrə minimum 6 simvol olmalıdır.");
    if (passwordData.newPassword !== passwordData.confirmPassword) return alert("Şifrələr uyğun gəlmir.");
    
    setIsUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
    setIsUpdatingPassword(false);

    if (error) {
      alert("Şifrə yenilənərkən xəta baş verdi: " + error.message);
    } else {
      alert("Şifrəniz uğurla yeniləndi!");
      setPasswordData({ newPassword: "", confirmPassword: "" });
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, isProfile: boolean) => {
    let val = e.target.value;
    if (!val.startsWith("+994 ")) val = "+994 ";
    const numbers = val.substring(5).replace(/\D/g, "");
    let formatted = "+994 ";
    if (numbers.length > 0) formatted += "(" + numbers.substring(0, 2);
    if (numbers.length >= 2) formatted += ") " + numbers.substring(2, 5);
    if (numbers.length >= 5) formatted += "-" + numbers.substring(5, 7);
    if (numbers.length >= 7) formatted += "-" + numbers.substring(7, 9);
    
    if (isProfile) setProfileData({ ...profileData, phone: formatted });
    else setOnboardingData({ ...onboardingData, phone: formatted });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApply = (project: any) => {
    setSelectedProjectForApp(project);
    setApplicationFormData({});
  };

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForApp) return;

    const payload = {
      project_id: selectedProjectForApp.id,
      user_name: `${profileData.firstName} ${profileData.lastName}`,
      user_email: session.user.email,
      user_id: session.user.id,
      answers: applicationFormData,
      status: "Pending"
    };

    const { error } = await supabase.from("applications").insert([payload]);
    if (error) {
      alert("Müraciət göndərilərkən xəta baş verdi: " + error.message);
      return;
    }

    alert("Müraciətiniz uğurla göndərildi!");
    setIsNewAppModalOpen(false);
    setSelectedProjectForApp(null);
    fetchData(session.user.id); // Refresh
  };

  if (!session) return <div className="min-h-screen flex items-center justify-center">Yüklənir...</div>;

  return (
    <div className="min-h-screen bg-muted/30 pt-8 pb-24">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm sticky top-24">
              <div className="flex flex-col items-center text-center mb-8 relative group cursor-pointer" onClick={() => isEditingProfile && fileInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 overflow-hidden relative border-2 border-transparent group-hover:border-primary transition-all">
                  {profileData.avatar ? (
                    <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-primary">{profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}</span>
                  )}
                  {isEditingProfile && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white opacity-80" />
                    </div>
                  )}
                </div>
                <input type="file" hidden ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" />
                <h2 className="text-xl font-bold">{profileData.firstName} {profileData.lastName}</h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mt-2 truncate max-w-[200px]">
                  <span className="w-2 h-2 shrink-0 rounded-full bg-primary animate-pulse" />
                  {session.user.id.substring(0, 8)}...
                </span>
              </div>

              <nav className="space-y-2">
                {[
                  { id: "profile", label: "Profilim", icon: User },
                  { id: "apps", label: "Müraciətlər", icon: FileText },
                  { id: "leaderboard", label: "Reytinq və Tarixçə", icon: Trophy },
                  { id: "resources", label: "Resurslar", icon: BookOpen },
                  { id: "certs", label: "Sertifikatlar", icon: Award },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
                      activeTab === item.id 
                        ? "bg-primary text-white shadow-md shadow-primary/20" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-border">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors font-medium text-sm"
                >
                  <LogOut className="w-5 h-5" />
                  Çıxış et
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-sm min-h-[600px] relative"
            >
              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold">Şəxsi Məlumatlar</h3>
                    {!isEditingProfile ? (
                      <button onClick={() => setIsEditingProfile(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium text-sm">
                        <Edit2 className="w-4 h-4" /> Profili Redaktə Et
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button onClick={() => setIsEditingProfile(false)} className="px-4 py-2 rounded-lg hover:bg-muted transition-colors font-medium text-sm text-muted-foreground">Ləğv et</button>
                        <button onClick={saveProfile} className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors font-medium text-sm">Yadda Saxla</button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Ad</label>
                      {isEditingProfile ? (
                        <input className="w-full border border-border rounded-lg p-2.5 bg-background focus:ring-2 focus:ring-primary/50 outline-none" value={profileData.firstName} onChange={e => setProfileData({...profileData, firstName: e.target.value})} />
                      ) : (
                        <p className="font-medium text-lg border border-transparent p-2.5 pl-0">{profileData.firstName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Soyad</label>
                      {isEditingProfile ? (
                        <input className="w-full border border-border rounded-lg p-2.5 bg-background focus:ring-2 focus:ring-primary/50 outline-none" value={profileData.lastName} onChange={e => setProfileData({...profileData, lastName: e.target.value})} />
                      ) : (
                        <p className="font-medium text-lg border border-transparent p-2.5 pl-0">{profileData.lastName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">E-poçt</label>
                      <p className="font-medium text-lg border border-transparent p-2.5 pl-0 opacity-70">{session.user.email} (Dəyişdirilə bilməz)</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Telefon</label>
                      {isEditingProfile ? (
                        <input className="w-full border border-border rounded-lg p-2.5 bg-background focus:ring-2 focus:ring-primary/50 outline-none" value={profileData.phone} onChange={e => handlePhoneChange(e, true)} maxLength={19} />
                      ) : (
                        <p className="font-medium text-lg border border-transparent p-2.5 pl-0">{profileData.phone || "Qeyd olunmayıb"}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Region</label>
                      {isEditingProfile ? (
                        <select className="w-full border border-border rounded-lg p-2.5 bg-background focus:ring-2 focus:ring-primary/50 outline-none" value={profileData.region} onChange={e => setProfileData({...profileData, region: e.target.value})}>
                          {AZERBAIJAN_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      ) : (
                        <p className="font-medium text-lg border border-transparent p-2.5 pl-0">{profileData.region}</p>
                      )}
                    </div>
                  </div>

                  {/* Change Password Block */}
                  <div className="mt-8 border-t border-border pt-8">
                    <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" /> Şifrəni Yenilə
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">Əgər Google vasitəsilə qeydiyyatdan keçmisinizsə və ya şifrənizi dəyişmək istəyirsinizsə, aşağıdan yeni şifrə təyin edə bilərsiniz.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Yeni Şifrə</label>
                        <input type="password" placeholder="Minimum 6 simvol" className="w-full border border-border rounded-lg p-2.5 bg-background focus:ring-2 focus:ring-primary/50 outline-none" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Şifrəni Təkrarla</label>
                        <input type="password" placeholder="Minimum 6 simvol" className="w-full border border-border rounded-lg p-2.5 bg-background focus:ring-2 focus:ring-primary/50 outline-none" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} />
                      </div>
                      <div className="md:col-span-2">
                        <button 
                          onClick={handleUpdatePassword} 
                          disabled={isUpdatingPassword || !passwordData.newPassword}
                          className="px-6 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors font-medium text-sm disabled:opacity-50"
                        >
                          {isUpdatingPassword ? "Yenilənir..." : "Şifrəni Yenilə"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notifications Block */}
                  {notifications.length > 0 && (
                    <div className="mt-8 border-t border-border pt-8">
                      <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-primary" /> Son Bildirişlər
                      </h4>
                      <div className="space-y-4">
                        {notifications.map(n => (
                          <div key={n.id} className="p-4 rounded-xl border border-border bg-card flex gap-4 shadow-sm">
                            <div className={`mt-1 shrink-0 ${n.type === 'success' ? 'text-green-500' : n.type === 'warning' ? 'text-orange-500' : 'text-primary'}`}>
                              {n.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : n.type === 'warning' ? <AlertTriangle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
                            </div>
                            <div>
                              <h5 className="font-bold text-lg mb-1">{n.title}</h5>
                              <p className="text-muted-foreground text-sm whitespace-pre-wrap">{n.content}</p>
                              <p className="text-xs text-muted-foreground mt-2">{new Date(n.created_at).toLocaleString('az-AZ', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Action CTAs */}
                  <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* AI Partner CTA */}
                    <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-primary to-primary-hover text-white flex flex-col justify-between shadow-xl relative overflow-hidden group">
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
                      <div>
                        <h4 className="text-2xl font-bold mb-2 flex items-center gap-2"><Bot className="w-6 h-6" /> AI ilə Məşq Et</h4>
                        <p className="text-white/80 mb-6">Gemini 1.5 süni intellekti ilə real debata girin. Arqumentlərinizi yoxlayın və dərhal qiymət alın.</p>
                      </div>
                      <Link href="/az/ai-partner" className="inline-flex w-fit px-6 py-3 bg-white text-primary font-bold rounded-xl shadow-md hover:scale-105 transition-transform items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" /> Debata Başla
                      </Link>
                    </div>

                    {/* Rooms CTA */}
                    <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 text-white flex flex-col justify-between shadow-xl relative overflow-hidden group">
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
                      <div>
                        <h4 className="text-2xl font-bold mb-2 flex items-center gap-2"><Users className="w-6 h-6" /> Canlı Otaqlar</h4>
                        <p className="text-white/80 mb-6">Dostlarınızla və ya digər debatçılarla canlı səsli və görüntülü müzakirələrə qoşulun.</p>
                      </div>
                      <Link href="/az/rooms" className="inline-flex w-fit px-6 py-3 bg-white text-blue-600 font-bold rounded-xl shadow-md hover:scale-105 transition-transform items-center gap-2">
                        <Users className="w-5 h-5" /> Otaqlara Keç
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* APPLICATIONS TAB */}
              {activeTab === "apps" && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold">Müraciətlərim</h3>
                    <button onClick={() => setIsNewAppModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors font-medium text-sm shadow-md">
                      <Plus className="w-4 h-4" /> Yeni Müraciət Yarat
                    </button>
                  </div>

                  {isLoadingApps ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : applications.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">Heç bir müraciət tapılmadı.</div>
                  ) : (
                    <div className="space-y-4">
                      {applications.map(app => (
                        <div key={app.id} className="p-5 rounded-2xl border border-border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h4 className="font-bold text-lg mb-1">{app.name}</h4>
                            <p className="text-sm text-muted-foreground">Tarix: {app.date}</p>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-medium text-sm w-fit ${
                            app.status === "Pending" ? "bg-yellow-500/10 text-yellow-600" :
                            app.status === "Approved" ? "bg-green-500/10 text-green-600" :
                            "bg-red-500/10 text-red-600"
                          }`}>
                            {app.status === "Pending" ? <Clock className="w-4 h-4" /> : 
                             app.status === "Approved" ? <CheckCircle2 className="w-4 h-4" /> : 
                             <X className="w-4 h-4" />}
                            {app.status === "Pending" ? "Gözləyir" : 
                             app.status === "Approved" ? "Təsdiqləndi" : "İmtina edildi"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* RESOURCES TAB */}
              {activeTab === "resources" && (
                <div>
                  <h3 className="text-2xl font-bold mb-8">Resurslar</h3>
                  
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <PlayCircle className="w-5 h-5 text-primary" />
                      <h4 className="text-lg font-semibold">Video Təlimlər</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2].map(i => (
                        <div key={i} className="group cursor-pointer p-3 rounded-2xl border border-border hover:border-primary/50 transition-colors bg-muted/20">
                          <div className="w-full h-32 bg-black/5 dark:bg-white/5 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden">
                            <PlayCircle className="w-12 h-12 text-primary z-10 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                          </div>
                          <h5 className="font-bold px-1">Mövzu: Debatın Əsasları {i}</h5>
                          <p className="text-xs text-muted-foreground px-1 mt-1">15 dəqiqə • YouTube</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <FileIcon className="w-5 h-5 text-primary" />
                      <h4 className="text-lg font-semibold">PDF Materiallar</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        "Milli Debat Qaydaları Kitabçası", 
                        "Arqumentasiya Texnikaları",
                        "Hakimlik Təlimatı"
                      ].map((title, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer group">
                          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 group-hover:bg-red-500/20 transition-colors">
                            <FileText className="w-5 h-5 text-red-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-sm truncate">{title}</h5>
                            <p className="text-xs text-muted-foreground mt-0.5">PDF • 2.4 MB</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CERTIFICATES TAB */}
              {activeTab === "certs" && (
                <div>
                  <h3 className="text-2xl font-bold mb-6">Sertifikatlar</h3>
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary-neon/5 border border-primary/20 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Award className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="font-bold text-xl mb-1">İştirakçı Sertifikatı</h4>
                      <p className="text-muted-foreground text-sm mb-2">Gənclər Şəbəkəsi Forumu 2026</p>
                      <p className="text-xs font-mono text-muted-foreground">ID: CERT-2026-9912</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors shadow-md flex items-center justify-center gap-2">
                        PDF Yüklə
                      </button>
                      <Link href="/az/verify/CERT-2026-9912" className="px-6 py-2.5 bg-green-500/10 text-green-600 rounded-xl font-medium hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2">
                        <QrCode className="w-4 h-4" /> Doğrula (QR)
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* LEADERBOARD TAB (Phase 3.5) */}
              {activeTab === "leaderboard" && (
                <div>
                  <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-500" /> Həftənin Debatçıları
                  </h3>
                  
                  {/* Leaderboard UI (Mock) */}
                  <div className="space-y-3 mb-10">
                    {[
                      { name: "Leyla Əliyeva", id: "DVC-2026-1024", score: 98, avatar: "L" },
                      { name: "Rəşad Quliyev", id: "DVC-2026-5512", score: 95, avatar: "R" },
                      { name: "Siz (Mövcud Sessiya)", id: session.user.id.substring(0,8), score: 92, avatar: "S" },
                    ].map((user, i) => (
                      <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border ${i === 2 ? 'bg-primary/5 border-primary/30' : 'bg-card border-border'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-yellow-500 text-white' : i === 1 ? 'bg-gray-300 text-gray-800' : 'bg-primary text-white'}`}>
                          {i + 1}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold">
                          {user.avatar}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold">{user.name}</h4>
                          <p className="text-xs text-muted-foreground font-mono">{user.id}</p>
                        </div>
                        <div className="font-bold text-lg text-primary">
                          {user.score} Xal
                        </div>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" /> AI Debat Tarixçəm
                  </h3>
                  
                  <div className="space-y-4">
                    {(() => {
                      const savedHistory = typeof window !== 'undefined' ? localStorage.getItem("dvc-ai-history") : null;
                      const history = savedHistory ? JSON.parse(savedHistory) : [];
                      
                      if (history.length === 0) {
                        return <p className="text-muted-foreground text-sm">Hələ ki, heç bir AI debat tarixçəniz yoxdur.</p>;
                      }

                      return history.map((h: any) => (
                        <div key={h.id} className="p-5 rounded-2xl border border-border bg-card shadow-sm">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-bold">{h.topic}</h4>
                            <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-sm font-bold">{h.score} / 100</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">{h.date}</p>
                          <p className="text-sm text-foreground/80 line-clamp-2">{h.evaluation}</p>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        </div>
      </div>

      {/* NEW APPLICATION MODAL */}
      <AnimatePresence>
        {isNewAppModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => { setIsNewAppModalOpen(false); setSelectedProjectForApp(null); }} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
              
              {!selectedProjectForApp ? (
                <>
                  <h3 className="text-2xl font-bold mb-2">Aktiv Layihələr</h3>
                  <p className="text-muted-foreground mb-6">Qoşulmaq istədiyiniz proqramı seçin.</p>
                  
                  <div className="space-y-3">
                    {activeProjects.map(project => {
                      const title = project.title_az; // AZ as fallback for now
                      const hasApplied = applications.some(a => a.project_id === project.id);
                      return (
                        <div key={project.id} className="p-4 rounded-xl border border-border flex items-center justify-between gap-4">
                          <div>
                            <h4 className="font-bold">{title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{project.description_az}</p>
                          </div>
                          <button 
                            disabled={hasApplied}
                            onClick={() => handleApply(project)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                              hasApplied ? "bg-muted text-muted-foreground" : "bg-primary text-white hover:bg-primary-hover"
                            }`}
                          >
                            {hasApplied ? "Müraciət edilib" : "Müraciət et"}
                          </button>
                        </div>
                      );
                    })}
                    {activeProjects.length === 0 && (
                      <div className="text-muted-foreground text-sm">Hal-hazırda aktiv müraciət layihəsi yoxdur.</div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button onClick={() => setSelectedProjectForApp(null)} className="text-sm font-medium text-primary hover:underline mb-4 inline-block">&larr; Siyahıya qayıt</button>
                  <h3 className="text-xl font-bold mb-1">{selectedProjectForApp.title_az}</h3>
                  <p className="text-muted-foreground text-sm mb-6">Zəhmət olmasa aşağıdakı müraciət formunu doldurun.</p>
                  
                  <form onSubmit={submitApplication} className="space-y-4">
                    {selectedProjectForApp.form_schema?.fields?.map((field: any) => (
                      <div key={field.id} className="space-y-1.5">
                        <label className="text-sm font-medium">
                          {field.label_az} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.type === "textarea" ? (
                          <textarea
                            required={field.required}
                            rows={3}
                            className="w-full border border-border rounded-lg p-2.5 bg-background focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                            value={applicationFormData[field.id] || ""}
                            onChange={(e) => setApplicationFormData({...applicationFormData, [field.id]: e.target.value})}
                          />
                        ) : field.type === "select" ? (
                          <select
                            required={field.required}
                            className="w-full border border-border rounded-lg p-2.5 bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                            value={applicationFormData[field.id] || ""}
                            onChange={(e) => setApplicationFormData({...applicationFormData, [field.id]: e.target.value})}
                          >
                            <option value="">-- Seçin --</option>
                            {field.options_az?.map((opt: string) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            required={field.required}
                            type={field.type}
                            className="w-full border border-border rounded-lg p-2.5 bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                            value={applicationFormData[field.id] || ""}
                            onChange={(e) => setApplicationFormData({...applicationFormData, [field.id]: e.target.value})}
                          />
                        )}
                      </div>
                    ))}
                    
                    <button 
                      type="submit"
                      className="w-full bg-primary text-white rounded-xl py-3 font-semibold hover:bg-primary-hover transition-colors mt-6 shadow-md"
                    >
                      Müraciəti Tamamla / Göndər
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ONBOARDING MODAL */}
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-8 relative"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Profili Tamamlayın</h3>
                <p className="text-muted-foreground text-sm">Zəhmət olmasa platformadan istifadəyə davam etmək üçün bu məlumatları təqdim edin.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefon</label>
                  <input required type="tel" className="w-full border border-border rounded-xl py-3 px-4 bg-background focus:ring-2 focus:ring-primary/50 outline-none" value={onboardingData.phone} onChange={e => handlePhoneChange(e, false)} maxLength={19} placeholder="+994 (XX) XXX-XX-XX" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Region</label>
                  <select className="w-full border border-border rounded-xl py-3 px-4 bg-background focus:ring-2 focus:ring-primary/50 outline-none" value={onboardingData.region} onChange={e => setOnboardingData({...onboardingData, region: e.target.value})}>
                    {AZERBAIJAN_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Təhsil Müəssisəsi (istəyə bağlı)</label>
                  <input type="text" className="w-full border border-border rounded-xl py-3 px-4 bg-background focus:ring-2 focus:ring-primary/50 outline-none" value={onboardingData.education} onChange={e => setOnboardingData({...onboardingData, education: e.target.value})} placeholder="Universitet / Məktəb" />
                </div>
                
                <div className="space-y-2 pt-4 border-t border-border">
                  <h4 className="font-semibold mb-1">Gələcək Giriş Üçün Şifrə Təyin Edin</h4>
                  <p className="text-xs text-muted-foreground mb-3">Google hesabınızdan asılı olmamaq üçün şifrə yaradın.</p>
                  
                  <label className="text-sm font-medium">Şifrə Təyin Et</label>
                  <input required type="password" minLength={6} className="w-full border border-border rounded-xl py-3 px-4 bg-background focus:ring-2 focus:ring-primary/50 outline-none" value={onboardingData.password} onChange={e => setOnboardingData({...onboardingData, password: e.target.value})} placeholder="Minimum 6 simvol" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Şifrəni Təkrarla</label>
                  <input required type="password" minLength={6} className="w-full border border-border rounded-xl py-3 px-4 bg-background focus:ring-2 focus:ring-primary/50 outline-none" value={onboardingData.confirmPassword} onChange={e => setOnboardingData({...onboardingData, confirmPassword: e.target.value})} placeholder="Şifrəni təkrarlayın" />
                </div>

                <button 
                  onClick={saveOnboarding}
                  disabled={isOnboardingLoading}
                  className="w-full bg-primary text-white rounded-xl py-4 font-semibold hover:bg-primary-hover transition-colors mt-6"
                >
                  {isOnboardingLoading ? "Yadda Saxlanılır..." : "Tamamla və Davam Et"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
