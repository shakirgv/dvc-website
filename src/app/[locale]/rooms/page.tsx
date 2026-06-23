"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Users, Plus, ShieldCheck, Search, X, MessageSquare, Clock } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { MOCK_AUTH } from "@/lib/mock-auth";
import { useEffect } from "react";

const OFFICIAL_ROOMS = [
  { id: "official-1", name: "Milli Turnir: Yarımfinal", topic: "Süni İntellekt Təhsil Sisteminə Zərərlidir", participants: 12, maxParticipants: 20, isOfficial: true },
  { id: "official-2", name: "Həftəlik Debat", topic: "Karbondioksid vergiləri artırılmalıdır", participants: 4, maxParticipants: 10, isOfficial: true },
];

const INITIAL_USER_ROOMS = [
  { id: "room-1", name: "Sərbəst Müzakirə: Gənclər", topic: "Freelance iş yoxsa Ofis?", participants: 2, maxParticipants: 4, isOfficial: false },
  { id: "room-2", name: "Tələbə Debatı", topic: "Təhsil kreditləri ləğv edilməlidir", participants: 1, maxParticipants: 2, isOfficial: false },
];

export default function RoomsLobbyPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "az";
  const [session, setSession] = useState<any>(null);
  
  const [userRooms, setUserRooms] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [newRoom, setNewRoom] = useState({ name: "", topic: "", maxParticipants: "2" });

  useEffect(() => {
    setSession(MOCK_AUTH.getSession() || { firstName: "Qonaq", lastName: "" });
    const saved = localStorage.getItem("dvc-user-rooms");
    if (saved) {
      setUserRooms(JSON.parse(saved));
    } else {
      setUserRooms(INITIAL_USER_ROOMS);
    }
  }, []);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `room-${Date.now()}`;
    const newRoomObj = {
      id,
      name: newRoom.name,
      topic: newRoom.topic,
      participants: 1,
      maxParticipants: parseInt(newRoom.maxParticipants),
      isOfficial: false,
      creator: `${session?.firstName || "İstifadəçi"} ${session?.lastName || ""}`
    };
    
    const updatedRooms = [newRoomObj, ...userRooms];
    setUserRooms(updatedRooms);
    localStorage.setItem("dvc-user-rooms", JSON.stringify(updatedRooms));
    
    setIsCreateModalOpen(false);
    router.push(`/${locale}/rooms/${id}`);
  };

  const allRooms = [...OFFICIAL_ROOMS, ...userRooms].filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    room.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-muted/30 pt-24 pb-12 px-4">
      <div className="container max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold mb-3">Debat Otaqları</h1>
            <p className="text-muted-foreground text-lg">Mövzunuzu seçin və real-time olaraq rəqiblərinizlə debata başlayın.</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" /> Sərbəst Otaq Yarat
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Otaq və ya mövzu axtar..."
            className="w-full bg-card border border-border rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {allRooms.map((room, idx) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`group relative bg-card rounded-3xl p-6 shadow-sm transition-all hover:shadow-xl flex flex-col h-full ${
                  room.isOfficial ? 'border-2 border-primary' : 'border border-border hover:border-primary/50'
                }`}
              >
                {room.isOfficial && (
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-md">
                    <ShieldCheck className="w-3.5 h-3.5" /> RƏSMİ
                  </div>
                )}

                <div className="flex justify-between items-start mb-4 mt-2">
                  <h3 className="font-bold text-lg leading-tight pr-4">{room.name}</h3>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-xs font-semibold shrink-0">
                    <Users className="w-3.5 h-3.5" /> {room.participants}/{room.maxParticipants}
                  </div>
                </div>

                <div className="mb-6 space-y-3">
                  {room.creator && (
                    <div className="flex gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-muted-foreground text-xs font-medium">Yaradıcı: {room.creator}</span>
                    </div>
                  )}
                  <div className="flex gap-2 text-sm">
                    <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-muted-foreground line-clamp-2">{room.topic}</span>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Status: <span className="text-green-500 font-medium">Aktiv</span></span>
                  </div>
                </div>

                <Link 
                  href={`/${locale}/rooms/${room.id}`}
                  className={`block w-full py-3 text-center rounded-xl font-medium transition-colors mt-auto ${
                    room.isOfficial 
                      ? "bg-primary text-white hover:bg-primary-hover shadow-md" 
                      : "bg-primary/90 text-white hover:bg-primary shadow-sm"
                  }`}
                >
                  Qoşul
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {allRooms.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">Otaq Tapılmadı</h3>
            <p className="text-muted-foreground">Axtarışınıza uyğun debat otağı yoxdur.</p>
          </div>
        )}
      </div>

      {/* CREATE ROOM MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-6 relative"
            >
              <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-2xl font-bold mb-2">Yeni Otaq Yarat</h3>
              <p className="text-muted-foreground mb-6">Dostlarınızı və ya digər debatçıları dəvət etmək üçün otaq açın.</p>
              
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Otağın Adı</label>
                  <input required type="text" className="w-full border border-border rounded-xl p-3 bg-background focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Məs: Dostlar arası debat" value={newRoom.name} onChange={(e) => setNewRoom({...newRoom, name: e.target.value})} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Debat Mövzusu</label>
                  <input required type="text" className="w-full border border-border rounded-xl p-3 bg-background focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Məs: Kosmos araşdırmaları lazımsızdır" value={newRoom.topic} onChange={(e) => setNewRoom({...newRoom, topic: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Maksimum İştirakçı (Nəfər)</label>
                  <select className="w-full border border-border rounded-xl p-3 bg-background focus:ring-2 focus:ring-primary/50 outline-none" value={newRoom.maxParticipants} onChange={(e) => setNewRoom({...newRoom, maxParticipants: e.target.value})}>
                    <option value="2">2 nəfər (Təkbətək)</option>
                    <option value="4">4 nəfər (Komanda)</option>
                    <option value="6">6 nəfər (Qrup)</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-primary text-white rounded-xl py-4 font-semibold hover:bg-primary-hover transition-colors mt-6 shadow-md flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" /> Otağı Yarat və Keç
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
