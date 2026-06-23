"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Building2, Calendar, Users, Phone, Mail, ChevronRight, User, PlusCircle, X, CheckCircle2, Send } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ClubDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const locale = params?.locale || "az";

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", motivation: "" });
  const [showToast, setShowToast] = useState(false);

  // Mock fetching data based on slug. In real app, fetch from API.
  const getClubData = () => {
    const formattedName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    return {
      name: formattedName.replace("Debat Klubu", "Debat Klubu"),
      established: "2005",
      membersCount: 120,
      description: "Bu debat klubu ölkədə fəaliyyət göstərən ən qədim və ən aktiv gənclər təşkilatlarından biridir. Hər il tələbələr arasında onlarla fərqli formatda debat turnirləri keçirilir və tələbələrin şəxsi inkişafına mühüm töhfə verir.",
      achievements: [
        "2025-ci il Milli Debat Forumu Çempionu",
        "100+ aktiv təlimçi bazası",
        "Ən yaxşı spiker mükafatı - 3 il ard-arda"
      ],
      head: {
        name: "Lalə Cəfərova",
        position: "Klub Sədri",
        phone: "+994 50 000 00 01",
        email: `lale.c@${slug}.dvc.az`
      }
    };
  };

  const club = getClubData();

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add to mock session applications array
    const sessionStr = localStorage.getItem("dvc-mock-session");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (!session.applications) session.applications = [];
      
      session.applications.push({
        id: Date.now(),
        name: `${club.name} - Üzvlük Müraciəti`,
        date: new Date().toLocaleDateString("az-AZ"),
        status: "Pending",
        responses: {
          AdSoyad: formData.name,
          Email: formData.email,
          Telefon: formData.phone,
          Motivasiya: formData.motivation
        }
      });
      localStorage.setItem("dvc-mock-session", JSON.stringify(session));
    } else {
      // If no session exists, create a dummy one just for demo
      const demoSession = {
        id: "USR-000",
        firstName: formData.name.split(' ')[0] || "İstifadəçi",
        lastName: formData.name.split(' ')[1] || "",
        email: formData.email,
        applications: [{
          id: Date.now(),
          name: `${club.name} - Üzvlük Müraciəti`,
          date: new Date().toLocaleDateString("az-AZ"),
          status: "Pending",
          responses: {
            AdSoyad: formData.name,
            Email: formData.email,
            Telefon: formData.phone,
            Motivasiya: formData.motivation
          }
        }]
      };
      localStorage.setItem("dvc-mock-session", JSON.stringify(demoSession));
    }

    setShowForm(false);
    setShowToast(true);
    setFormData({ name: "", email: "", phone: "", motivation: "" });
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href={`/${locale}`} className="hover:text-primary transition-colors">Ana Səhifə</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/${locale}/centers`} className="hover:text-primary transition-colors">Mərkəzlər</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{club.name}</span>
        </div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-3xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-xl">
            <Building2 className="w-16 h-16 md:w-24 md:h-24 text-primary" />
          </div>

          <div className="text-center md:text-left relative z-10">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{club.name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium mb-6">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full">
                <Calendar className="w-4 h-4 text-primary" /> Təsis ili: {club.established}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full">
                <Users className="w-4 h-4 text-primary" /> Aktiv üzv: {club.membersCount}+
              </span>
            </div>
            
            <div className="flex justify-center md:justify-start">
              <button 
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-hover transition-colors group"
              >
                <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Kluba Üzv Ol
              </button>
            </div>
          </div>
        </motion.div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-3xl p-8 shadow-sm"
            >
              <h2 className="text-2xl font-bold mb-4">Haqqında</h2>
              <p className="text-muted-foreground leading-relaxed">
                {club.description}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-3xl p-8 shadow-sm"
            >
              <h2 className="text-2xl font-bold mb-4">Əsas Uğurlar</h2>
              <ul className="space-y-3">
                {club.achievements.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Sidebar / Contact */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-3xl p-8 shadow-sm"
            >
              <h2 className="text-xl font-bold mb-6">Klub Rəhbərliyi</h2>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">{club.head.name}</h3>
                  <p className="text-xs text-muted-foreground">{club.head.position}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="font-medium">{club.head.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="font-medium text-primary hover:underline cursor-pointer">{club.head.email}</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Application Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-card border border-border rounded-3xl p-8 relative shadow-2xl"
            >
              <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-bold mb-2">Kluba Üzv Ol</h2>
              <p className="text-muted-foreground text-sm mb-6">{club.name} üçün müraciət forması.</p>
              
              <form className="space-y-4" onSubmit={handleJoinSubmit}>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ad və Soyad</label>
                  <input 
                    type="text" required
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">E-poçt</label>
                    <input 
                      type="email" required
                      value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-background border border-border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Telefon</label>
                    <input 
                      type="tel" required
                      value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-background border border-border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Niyə məhz bu klub?</label>
                  <textarea 
                    required rows={3}
                    value={formData.motivation} onChange={(e) => setFormData({...formData, motivation: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                    placeholder="Motivasiyanızı qısaca qeyd edin..."
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-primary text-white font-bold rounded-xl py-3.5 hover:bg-primary-hover transition-colors shadow-md flex items-center justify-center gap-2 group mt-2"
                >
                  Göndər <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-10 right-10 z-[60] flex items-center gap-3 bg-card border-2 border-primary/30 p-4 rounded-2xl shadow-2xl"
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <div className="mr-6">
              <h4 className="font-bold text-foreground">Təşəkkürlər!</h4>
              <p className="text-xs text-muted-foreground">Müraciətiniz admin panelə göndərildi.</p>
            </div>
            <button onClick={() => setShowToast(false)} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
