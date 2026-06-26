"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { LogOut, User, FileText, PlayCircle, Award, CheckCircle2, Clock, Edit2, Camera, Plus, X, BookOpen, File as FileIcon, Bot, Zap, Users, Trophy, QrCode, History, Loader2, AlertCircle, Bell, Info, AlertTriangle, Copy, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n-context";
import { AZERBAIJAN_REGIONS } from "@/lib/regions";
import { PasswordInput } from "@/components/ui/password-input";

export default function DashboardPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "az";
  const { t } = useTranslation();
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [activeProjects, setActiveProjects] = useState<any[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  
  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState<any>({});
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Applications State
  const [applications, setApplications] = useState<any[]>([]);
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [selectedProjectForApp, setSelectedProjectForApp] = useState<any>(null);
  const [applicationFormData, setApplicationFormData] = useState<any>({});

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);

  // Resources State
  const [resources, setResources] = useState<any[]>([]);

  // Certificates State
  const [certificates, setCertificates] = useState<any[]>([]);

  // AI Debate Setup Modal State
  const [isDebateModalOpen, setIsDebateModalOpen] = useState(false);
  const [debateTopicType, setDebateTopicType] = useState("manual"); // manual | ai
  const [debateTopic, setDebateTopic] = useState("");
  const [debateSide, setDebateSide] = useState("Təsdiq"); // Təsdiq | İnkar

  // Leaderboard State
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userDebates, setUserDebates] = useState<any[]>([]);

  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState({ phone: "+994 ", region: "Bakı", education: "", password: "", confirmPassword: "" });
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(false);
  
  // Password Update State
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);
  const [passwordUpdateError, setPasswordUpdateError] = useState("");

  // Delete Account State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

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
          avatar: profile.avatar_url || session.user.user_metadata.avatar_url || null,
          dvcId: profile.dvc_id || "DVC-YYYYY"
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

    // Fetch Resources
    const { data: resData } = await supabase
      .from("resources")
      .select("*")
      .or(`target_user_ids.is.null,target_user_ids.cs.{${userId}}`)
      .order("created_at", { ascending: false });
    if (resData) setResources(resData);

    // Fetch Certificates
    const { data: certData } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (certData) setCertificates(certData);

    // Fetch AI Debates Leaderboard (Aggregation)
    const { data: allDebates } = await supabase.from("ai_debates").select("user_id, score, profiles(first_name, last_name, dvc_id, avatar_url)");
    if (allDebates) {
      const userScores: Record<string, any> = {};
      allDebates.forEach((d: any) => {
        const uid = d.user_id;
        if (!userScores[uid]) {
          userScores[uid] = {
            id: uid,
            name: `${d.profiles?.first_name || ""} ${d.profiles?.last_name || ""}`.trim(),
            dvc_id: d.profiles?.dvc_id || "",
            avatar: d.profiles?.avatar_url || d.profiles?.first_name?.charAt(0) || "?",
            total_score: 0
          };
        }
        userScores[uid].total_score += (d.score || 0);
      });
      const sortedLeaderboard = Object.values(userScores).sort((a, b) => b.total_score - a.total_score);
      setLeaderboard(sortedLeaderboard);
    }

    // Fetch User's own debates history
    const { data: myDebates } = await supabase.from("ai_debates").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (myDebates) {
      setUserDebates(myDebates);
    }

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
    setPasswordUpdateError("");
    setPasswordUpdateSuccess(false);

    if (!passwordData.currentPassword) {
      setPasswordUpdateError("Mövcud şifrəni daxil edin.");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordUpdateError("Yeni şifrə minimum 6 simvol olmalıdır.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordUpdateError("Şifrələr uyğun gəlmir.");
      return;
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordUpdateError("Yeni şifrə mövcud şifrənizlə eyni ola bilməz.");
      return;
    }
    
    setIsUpdatingPassword(true);

    // 1. Verify Current Password via SignIn
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: passwordData.currentPassword,
    });

    if (signInError) {
      setIsUpdatingPassword(false);
      setPasswordUpdateError("Şifrəniz yanlışdır.");
      return;
    }

    // 2. Password is correct. Update to new password.
    const { error: updateError } = await supabase.auth.updateUser({ password: passwordData.newPassword });
    setIsUpdatingPassword(false);

    if (updateError) {
      setPasswordUpdateError("Şifrə yenilənərkən xəta baş verdi: " + updateError.message);
    } else {
      setPasswordUpdateSuccess(true);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordUpdateSuccess(false), 5000);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    if (!deletePassword) {
      setDeleteError("Zəhmət olmasa şifrənizi daxil edin.");
      return;
    }

    setIsDeletingAccount(true);

    // 1. Verify Password via SignIn
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: deletePassword,
    });

    if (signInError) {
      setIsDeletingAccount(false);
      setDeleteError("Daxil etdiyiniz şifrə yanlışdır");
      return;
    }

    // 2. Password is correct. Delete user via RPC
    const { error: deleteError } = await supabase.rpc('delete_user');

    if (deleteError) {
      setIsDeletingAccount(false);
      setDeleteError("Hesab silinərkən xəta baş verdi: " + deleteError.message);
      return;
    }

    // 3. Success
    setIsDeletingAccount(false);
    alert("Hesabınız uğurla silindi");
    await supabase.auth.signOut();
    router.push("/login");
  };

  const copyDvcId = () => {
    if (profileData.dvcId) {
      navigator.clipboard.writeText(profileData.dvcId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
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
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider">
                    {profileData.dvcId}
                  </span>
                  <button 
                    onClick={copyDvcId} 
                    className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors relative"
                    title="ID Kopyala"
                  >
                    {isCopied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    <AnimatePresence>
                      {isCopied && (
                        <motion.span 
                          initial={{ opacity: 0, y: 10, scale: 0.8 }}
                          animate={{ opacity: 1, y: -25, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute -top-2 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-10"
                        >
                          ID kopyalandı!
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </div>

              <nav className="space-y-2">
                {[
                  { id: "profile", label: "Profilim", icon: User },
                  { id: "apps", label: "Müraciətlər", icon: FileText },
                  { id: "leaderboard", label: "Reytinq və Tarixçə", icon: Trophy },
                  { id: "resources", label: "Resurslar", icon: BookOpen },
                  { id: "certs", label: "Sertifikatlar", icon: Award },
                  { id: "account", label: "Hesabı İdarə Et", icon: Zap },
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
                  
                  {/* Action CTAs */}
                  <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* AI Partner CTA */}
                    <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-primary to-primary-hover text-white flex flex-col justify-between shadow-xl relative overflow-hidden group">
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
                      <div>
                        <h4 className="text-2xl font-bold mb-2 flex items-center gap-2"><Bot className="w-6 h-6" /> AI ilə Məşq Et</h4>
                        <p className="text-white/80 mb-6">Gemini 1.5 süni intellekti ilə real debata girin. Arqumentlərinizi yoxlayın və dərhal qiymət alın.</p>
                      </div>
                      <button onClick={() => setIsDebateModalOpen(true)} className="inline-flex w-fit px-6 py-3 bg-white text-primary font-bold rounded-xl shadow-md hover:scale-105 transition-transform items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" /> Debata Başla
                      </button>
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
                  
                  {/* Videos */}
                  {resources.filter(r => r.type === 'video').length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <PlayCircle className="w-5 h-5 text-primary" />
                        <h4 className="text-lg font-semibold">Video Təlimlər</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {resources.filter(r => r.type === 'video').map((r) => (
                          <a href={r.file_url} target="_blank" rel="noopener noreferrer" key={r.id} className="group cursor-pointer p-3 rounded-2xl border border-border hover:border-primary/50 transition-colors bg-muted/20 block">
                            <div className="w-full h-32 bg-black/5 dark:bg-white/5 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden">
                              <PlayCircle className="w-12 h-12 text-primary z-10 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                            </div>
                            <h5 className="font-bold px-1">{r.title}</h5>
                            <p className="text-xs text-muted-foreground px-1 mt-1">{r.video_duration || "Bilinmir"}</p>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Files & Links */}
                  {(resources.filter(r => r.type === 'file' || r.type === 'link').length > 0) && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <FileIcon className="w-5 h-5 text-primary" />
                        <h4 className="text-lg font-semibold">Fayllar və Linklər</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {resources.filter(r => r.type === 'file' || r.type === 'link').map((r) => (
                          <a href={r.file_url} target="_blank" rel="noopener noreferrer" key={r.id} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer group block">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${r.type === 'file' ? 'bg-red-500/10 group-hover:bg-red-500/20' : 'bg-primary/10 group-hover:bg-primary/20'}`}>
                              {r.type === 'file' ? <FileText className="w-5 h-5 text-red-500" /> : <LinkIcon className="w-5 h-5 text-primary" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-sm truncate">{r.title}</h5>
                              <p className="text-xs text-muted-foreground mt-0.5">{r.type === 'file' ? `Fayl • ${r.file_size || 'N/A'}` : 'Xarici Link'}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {resources.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      Hazırda heç bir resurs yoxdur.
                    </div>
                  )}
                </div>
              )}

              {/* CERTIFICATES TAB */}
              {activeTab === "certs" && (
                <div>
                  <h3 className="text-2xl font-bold mb-6">Sertifikatlar</h3>
                  
                  {certificates.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      Sizə aid heç bir sertifikat tapılmadı.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {certificates.map((cert) => (
                        <div key={cert.id} className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary-neon/5 border border-primary/20 flex flex-col md:flex-row items-center gap-6">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Award className="w-8 h-8 text-primary" />
                          </div>
                          <div className="flex-1 text-center md:text-left">
                            <h4 className="font-bold text-xl mb-1">
                              {cert.type === 'participation' ? 'İştirakçı Sertifikatı' : cert.type === 'organization' ? 'Təşkilatçı Sertifikatı' : 'Fəxri Qonaq Sertifikatı'}
                            </h4>
                            <p className="text-muted-foreground text-sm mb-2">{cert.program_name}</p>
                            <p className="text-xs font-mono text-muted-foreground">ID: {cert.cert_id}</p>
                          </div>
                          <div className="flex flex-col gap-2 w-full md:w-auto">
                            <a href={cert.pdf_url} target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors shadow-md flex items-center justify-center gap-2">
                              PDF Yüklə
                            </a>
                            <Link href={`/${locale}/verify/${cert.cert_id}`} className="px-6 py-2.5 bg-green-500/10 text-green-600 rounded-xl font-medium hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2">
                              <QrCode className="w-4 h-4" /> Doğrula (QR)
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* LEADERBOARD TAB */}
              {activeTab === "leaderboard" && (
                <div>
                  <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-500" /> Ümumi Reytinq Cədvəli
                  </h3>
                  
                  {leaderboard.length === 0 ? (
                    <p className="text-muted-foreground text-sm mb-10">Hələ ki, heç kim debatda iştirak etməyib.</p>
                  ) : (
                    <div className="space-y-3 mb-10">
                      {leaderboard.map((user, i) => (
                        <div key={user.id} className={`flex items-center gap-4 p-4 rounded-2xl border ${user.id === session?.user?.id ? 'bg-primary/5 border-primary/30' : 'bg-card border-border'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-yellow-500 text-white' : i === 1 ? 'bg-gray-300 text-gray-800' : 'bg-primary text-white'}`}>
                            {i + 1}
                          </div>
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
                            {user.avatar.length === 1 ? user.avatar : <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold">{user.name} {user.id === session?.user?.id ? "(Siz)" : ""}</h4>
                            <p className="text-xs text-muted-foreground font-mono">{user.dvc_id}</p>
                          </div>
                          <div className="font-bold text-lg text-primary">
                            {user.total_score} Xal
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" /> AI Debat Tarixçəm
                  </h3>
                  
                  <div className="space-y-4">
                    {userDebates.length === 0 ? (
                      <p className="text-muted-foreground text-sm">Hələ ki, heç bir AI debat tarixçəniz yoxdur.</p>
                    ) : (
                      userDebates.map((h: any) => (
                        <div key={h.id} className="p-5 rounded-2xl border border-border bg-card shadow-sm">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold">{h.topic}</h4>
                              <p className="text-xs font-medium mt-1">Mövqe: {h.side}</p>
                            </div>
                            <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-sm font-bold shrink-0 ml-4">{h.score} / 100</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">{new Date(h.created_at).toLocaleString("az-AZ")}</p>
                          {h.feedback && <p className="text-sm text-foreground/80 line-clamp-3">{h.feedback}</p>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ACCOUNT TAB */}
              {activeTab === "account" && (
                <div>
                  <h3 className="text-2xl font-bold mb-8">Hesabı İdarə Et</h3>

                  {/* Change Password Block */}
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-10 relative">
                    <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" /> Şifrəni Yenilə
                    </h4>
                    <p className="text-sm text-muted-foreground mb-6">Mövcud şifrənizi dəyişdirmək üçün yeni şifrə təyin edə bilərsiniz.</p>
                    
                    <AnimatePresence>
                      {passwordUpdateSuccess && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 flex items-center gap-3 overflow-hidden"
                        >
                          <CheckCircle2 className="w-5 h-5 shrink-0" />
                          <span className="font-medium text-sm">Şifrəniz uğurla yeniləndi.</span>
                        </motion.div>
                      )}
                      {passwordUpdateError && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 flex items-center gap-3 overflow-hidden"
                        >
                          <AlertTriangle className="w-5 h-5 shrink-0" />
                          <span className="font-medium text-sm">{passwordUpdateError}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium">Mövcud Şifrə</label>
                        <PasswordInput placeholder="Hazırkı şifrəniz" value={passwordData.currentPassword} onChange={e => { setPasswordData({...passwordData, currentPassword: e.target.value}); setPasswordUpdateError(""); }} />
                        <div className="mt-2 text-right">
                          <Link href="/az/forgot-password" className="text-sm text-primary hover:underline font-medium">
                            Şifrəni unutmusunuz?
                          </Link>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Yeni Şifrə</label>
                        <PasswordInput placeholder="Minimum 6 simvol" value={passwordData.newPassword} onChange={e => { setPasswordData({...passwordData, newPassword: e.target.value}); setPasswordUpdateError(""); }} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Şifrəni Təkrarla</label>
                        <PasswordInput placeholder="Minimum 6 simvol" value={passwordData.confirmPassword} onChange={e => { setPasswordData({...passwordData, confirmPassword: e.target.value}); setPasswordUpdateError(""); }} />
                      </div>
                      <div className="md:col-span-2">
                        <button 
                          onClick={handleUpdatePassword} 
                          disabled={isUpdatingPassword || !passwordData.currentPassword || !passwordData.newPassword}
                          className="px-8 py-3 rounded-xl bg-primary text-white hover:bg-primary-hover transition-colors font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isUpdatingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                          {isUpdatingPassword ? "Yenilənir..." : "Şifrəni Yenilə"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delete Account Block */}
                  <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 shadow-sm">
                    <h4 className="text-xl font-bold mb-2 flex items-center gap-2 text-red-600">
                      <AlertTriangle className="w-5 h-5" /> Hesabı Sil
                    </h4>
                    <p className="text-sm text-red-600/80 mb-6">Hesabınızı birdəfəlik silmək qərarına gəlsəniz, bütün profil məlumatlarınız, müraciətləriniz və fəaliyyət tarixçəniz sistemdən silinəcək. Bu əməliyyat geri qaytarıla bilməz.</p>
                    
                    <button 
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="px-6 py-2.5 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-all font-medium text-sm flex items-center justify-center gap-2"
                    >
                      Hesabı Birdəfəlik Sil
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        </div>
      </div>

      {/* DELETE ACCOUNT MODAL */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-red-500/30 rounded-3xl shadow-2xl p-6 md:p-8 relative"
            >
              <button 
                onClick={() => { setIsDeleteModalOpen(false); setDeletePassword(""); setDeleteError(""); }} 
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Hesabı Silmək</h3>
                <p className="text-muted-foreground text-sm">Hesabınızı birdəfəlik silməyə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Təhlükəsizlik üçün cari şifrənizi daxil edin</label>
                  <PasswordInput 
                    placeholder="Şifrəniz" 
                    className={`w-full border rounded-xl p-3 bg-background focus:outline-none transition-all ${deleteError ? 'border-red-500 focus:ring-red-500/20' : 'border-border focus:ring-2 focus:ring-red-500/50'}`}
                    value={deletePassword} 
                    onChange={e => { setDeletePassword(e.target.value); setDeleteError(""); }} 
                  />
                  {deleteError && (
                    <p className="text-sm font-medium text-red-500 mt-1">{deleteError}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => { setIsDeleteModalOpen(false); setDeletePassword(""); setDeleteError(""); }} 
                    className="flex-1 py-3 rounded-xl border border-border bg-background hover:bg-muted font-medium transition-colors"
                  >
                    Ləğv et
                  </button>
                  <button 
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount || !deletePassword}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isDeletingAccount && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isDeletingAccount ? "Silinir..." : "Bəli, Əminəm"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                  <PasswordInput required minLength={6} value={onboardingData.password} onChange={e => setOnboardingData({...onboardingData, password: e.target.value})} placeholder="Minimum 6 simvol" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Şifrəni Təkrarla</label>
                  <PasswordInput required minLength={6} value={onboardingData.confirmPassword} onChange={e => setOnboardingData({...onboardingData, confirmPassword: e.target.value})} placeholder="Şifrəni təkrarlayın" />
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

      {/* AI DEBATE SETUP MODAL */}
      <AnimatePresence>
        {isDebateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button onClick={() => setIsDebateModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">AI Debat Parametrləri</h3>
                  <p className="text-muted-foreground text-sm mt-1">Debatınızın formatını təyin edin.</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Topic Type Tabs */}
                <div className="flex gap-2 p-1 bg-muted rounded-xl">
                  <button 
                    onClick={() => setDebateTopicType("manual")}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors ${debateTopicType === "manual" ? "bg-background shadow-sm" : "text-muted-foreground hover:bg-background/50"}`}
                  >
                    Özüm Yazıram
                  </button>
                  <button 
                    onClick={() => setDebateTopicType("ai")}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${debateTopicType === "ai" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:bg-background/50"}`}
                  >
                    <Zap className="w-4 h-4" /> Mövzunu AI seçsin
                  </button>
                </div>

                {/* Topic Input */}
                {debateTopicType === "manual" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase">Mövzunu Daxil Edin</label>
                    <textarea 
                      placeholder="Məsələn: Sosial şəbəkələr gənclərin inkişafına zərərlidir."
                      className="w-full min-h-[100px] border border-border rounded-xl p-4 bg-background focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                      value={debateTopic}
                      onChange={e => setDebateTopic(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 text-center">
                    <p className="text-sm text-primary/80">
                      Sistem avtomatik olaraq müasir dövrə uyğun, maraqlı və intellektual bir parlament debat mövzusu generasiya edəcək.
                    </p>
                  </div>
                )}

                {/* Side Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-muted-foreground uppercase">Sizin Mövqeyiniz</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setDebateSide("Təsdiq")}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${debateSide === "Təsdiq" ? "border-green-500 bg-green-500/5 text-green-600" : "border-border bg-card text-muted-foreground hover:border-green-500/50"}`}
                    >
                      <CheckCircle2 className="w-6 h-6" />
                      <span className="font-bold">Təsdiq (Hökumət)</span>
                    </button>
                    <button 
                      onClick={() => setDebateSide("İnkar")}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${debateSide === "İnkar" ? "border-red-500 bg-red-500/5 text-red-600" : "border-border bg-card text-muted-foreground hover:border-red-500/50"}`}
                    >
                      <X className="w-6 h-6" />
                      <span className="font-bold">İnkar (Müxalifət)</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-border mt-6">
                  <Link 
                    href={`/${locale}/ai-partner?topic=${encodeURIComponent(debateTopicType === "ai" ? "auto" : debateTopic)}&side=${encodeURIComponent(debateSide)}`}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-hover transition-colors shadow-md disabled:opacity-50"
                    onClick={(e) => {
                      if (debateTopicType === "manual" && !debateTopic.trim()) {
                        e.preventDefault();
                        alert("Zəhmət olmasa mövzunu daxil edin.");
                      }
                    }}
                  >
                    Müzakirəyə Başla <Zap className="w-5 h-5 text-yellow-300" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
