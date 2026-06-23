"use client";

import { useState } from "react";
import { Plus, Trash2, Search, Power, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState([
    { id: "official-1", name: "Milli Turnir: Yarımfinal", topic: "Süni İntellekt Təhsil Sisteminə Zərərlidir", maxParticipants: 20, isOfficial: true, status: "Active" },
    { id: "official-2", name: "Həftəlik Debat", topic: "Karbondioksid vergiləri artırılmalıdır", maxParticipants: 10, isOfficial: true, status: "Offline" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: "", topic: "", maxParticipants: 4 });

  const toggleStatus = (id: string) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, status: r.status === "Active" ? "Offline" : "Active" } : r));
  };

  const handleDelete = (id: string) => {
    if (confirm("Rəsmi otağı silmək istədiyinizə əminsiniz?")) {
      setRooms(rooms.filter(r => r.id !== id));
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setRooms([
      {
        id: `official-${Date.now()}`,
        name: newRoom.name,
        topic: newRoom.topic,
        maxParticipants: newRoom.maxParticipants,
        isOfficial: true,
        status: "Active"
      },
      ...rooms
    ]);
    setIsModalOpen(false);
    setNewRoom({ name: "", topic: "", maxParticipants: 4 });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Rəsmi Otaqların İdarəedilməsi</h1>
          <p className="text-muted-foreground mt-1">DVC-nin rəsmi debat və turnir otaqlarını yaradın və tənzimləyin.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Otaq axtar..." 
              className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-hover transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Yeni Rəsmi Otaq
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {rooms.map((room) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border-2 border-primary/20 rounded-3xl p-6 shadow-sm relative group overflow-hidden flex flex-col h-full"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-primary-neon" />
              
              <div className="flex justify-between items-start mt-2 mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md uppercase">Rəsmi Otaq</span>
                </div>
                <button 
                  onClick={() => toggleStatus(room.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    room.status === "Active" ? "bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white" : "bg-muted text-muted-foreground hover:bg-gray-300"
                  }`}
                >
                  <Power className="w-3.5 h-3.5" /> {room.status === "Active" ? "Aktiv" : "Deaktiv"}
                </button>
              </div>

              <h3 className="text-xl font-bold mb-2">{room.name}</h3>
              <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{room.topic}</p>

              <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                <div className="text-sm font-medium">Maks: <span className="text-primary">{room.maxParticipants} Nəfər</span></div>
                <button 
                  onClick={() => handleDelete(room.id)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Otağı Sil"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-6 md:p-8 relative"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground">
                <Trash2 className="w-5 h-5 opacity-0 pointer-events-none" /> {/* Placeholder for alignment */}
                <span className="text-2xl leading-none">&times;</span>
              </button>
              
              <h3 className="text-2xl font-bold mb-6">Yeni Rəsmi Otaq</h3>
              
              <form onSubmit={handleCreate} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-muted-foreground uppercase">Otağın Adı</label>
                  <input 
                    required type="text" 
                    placeholder="Məs: Turnir Finalı"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={newRoom.name}
                    onChange={e => setNewRoom({...newRoom, name: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-muted-foreground uppercase">Debat Mövzusu</label>
                  <textarea 
                    required rows={2}
                    placeholder="Mövzunu qeyd edin..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    value={newRoom.topic}
                    onChange={e => setNewRoom({...newRoom, topic: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-muted-foreground uppercase">İştirakçı Sayı</label>
                  <select 
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={newRoom.maxParticipants}
                    onChange={e => setNewRoom({...newRoom, maxParticipants: parseInt(e.target.value)})}
                  >
                    <option value={2}>2 Nəfər</option>
                    <option value={4}>4 Nəfər</option>
                    <option value={6}>6 Nəfər</option>
                    <option value={10}>10+ Nəfər</option>
                  </select>
                </div>

                <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-colors shadow-md mt-4">
                  Otağı Yarat
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
