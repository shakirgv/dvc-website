"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Search, Power, ShieldCheck, Loader2, Eye, Download, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import * as XLSX from "xlsx";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({ 
    name: "", 
    topic: "", 
    maxParticipants: 4, 
    lang: "az",
    rules: "Təhqirə yol verilmir\nHər çıxış üçün maksimum 3 dəqiqə ayrılır\nFakt və rəqəmlərə əsaslanmaq mütləqdir" 
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Live Chat Modal State
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [liveMessages, setLiveMessages] = useState<any[]>([]);

  useEffect(() => {
    fetchData();

    const roomsSub = supabase.channel('admin-rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_participants' }, () => {
        fetchParticipants();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(roomsSub);
    };
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('rooms')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data) setRooms(data);
    await fetchParticipants();
    setIsLoading(false);
  };

  const fetchParticipants = async () => {
    const { data } = await supabase.from('room_participants').select('*');
    if (data) setParticipants(data);
  };

  const toggleStatus = async (room: any) => {
    const newStatus = room.status === "active" ? "finished" : "active";
    await supabase.from('rooms').update({ status: newStatus }).eq('id', room.id);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu otağı birdəfəlik silmək istədiyinizə əminsiniz? (Geri qaytarılmır)")) {
      await supabase.from('rooms').delete().eq('id', id);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from('rooms').insert({
      title: newRoom.name,
      topic: newRoom.topic,
      max_capacity: newRoom.maxParticipants,
      is_official: true,
      creator_id: session.user.id,
      status: "waiting",
      room_type: "public",
      lang: newRoom.lang,
      rules: newRoom.rules.split('\n').filter(r => r.trim() !== '')
    });

    if (error) {
      alert("Xəta: " + error.message);
      return;
    }

    setIsModalOpen(false);
    setNewRoom({ 
      name: "", 
      topic: "", 
      maxParticipants: 4, 
      lang: "az",
      rules: "Təhqirə yol verilmir\nHər çıxış üçün maksimum 3 dəqiqə ayrılır\nFakt və rəqəmlərə əsaslanmaq mütləqdir" 
    });
  };

  const openLiveChat = async (roomId: string) => {
    setSelectedRoomId(roomId);
    setIsChatModalOpen(true);
    
    // Fetch initial messages manually parsing profiles
    const { data: msgs } = await supabase.from('room_messages').select('*').eq('room_id', roomId).order('created_at', { ascending: true });
    if (msgs) {
      const userIds = [...new Set(msgs.map(m => m.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        const { data: profs } = await supabase.from('profiles').select('id, first_name, last_name').in('id', userIds);
        if (profs) {
          const profMap = profs.reduce((acc: any, p: any) => { acc[p.id] = p; return acc; }, {});
          msgs.forEach(m => { m.profiles = profMap[m.user_id]; });
        }
      }
      setLiveMessages(msgs);
    }

    // Subscribe to new messages for this room
    supabase.channel(`live-chat-${roomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'room_messages', filter: `room_id=eq.${roomId}` }, async (payload) => {
        let newMsg = payload.new;
        if (newMsg.user_id) {
          const { data: prof } = await supabase.from('profiles').select('first_name, last_name').eq('id', newMsg.user_id).single();
          newMsg.profiles = prof;
        }
        setLiveMessages(prev => [...prev, newMsg]);
      })
      .subscribe();
  };

  const closeLiveChat = () => {
    if (selectedRoomId) {
      supabase.removeChannel(supabase.channel(`live-chat-${selectedRoomId}`));
    }
    setIsChatModalOpen(false);
    setSelectedRoomId(null);
    setLiveMessages([]);
  };

  const exportToExcel = () => {
    const finishedRooms = rooms.filter(r => r.status === 'finished');
    if (finishedRooms.length === 0) {
      alert("İxrac ediləcək bitmiş turnir yoxdur.");
      return;
    }

    const data = finishedRooms.map(r => ({
      "Otaq ID": r.id,
      "Adı": r.title,
      "Mövzu": r.topic,
      "Dil": r.lang?.toUpperCase() || 'AZ',
      "Tutum": r.max_capacity,
      "Rəsmi Otaq": r.is_official ? "Bəli" : "Xeyr",
      "Tarix": new Date(r.created_at).toLocaleString('az-AZ')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tarixçə");
    XLSX.writeFile(wb, "dvc_turnir_tarixcesi.xlsx");
  };

  // Derived Stats
  const activeCount = rooms.filter(r => r.status === 'active').length;
  const waitingCount = rooms.filter(r => r.status === 'waiting').length;
  const finishedCount = rooms.filter(r => r.status === 'finished').length;

  const ongoingRooms = rooms.filter(r => r.status === 'active' || r.status === 'waiting').filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const finishedRooms = rooms.filter(r => r.status === 'finished').filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* ANALYTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4 border-l-4 border-l-red-500">
          <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
            <Power className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Aktiv Otaqlar (Canlı)</p>
            <h3 className="text-2xl font-bold">{activeCount}</h3>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4 border-l-4 border-l-yellow-500">
          <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Gözləyən Otaqlar (Lobby)</p>
            <h3 className="text-2xl font-bold">{waitingCount}</h3>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4 border-l-4 border-l-green-500">
          <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Bitmiş Turnirlər (Tarixçə)</p>
            <h3 className="text-2xl font-bold">{finishedCount}</h3>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">Canlı Nəzarət Paneli</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <AnimatePresence>
              {ongoingRooms.map((room) => {
                const partsCount = participants.filter(p => p.room_id === room.id).length;
                return (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-card border-2 border-primary/20 rounded-3xl p-6 shadow-sm relative group overflow-hidden flex flex-col h-full"
                  >
                    <div className={`absolute top-0 left-0 w-full h-1.5 ${room.status === 'active' ? 'bg-red-500' : 'bg-gradient-to-r from-primary to-primary-neon'}`} />
                    
                    <div className="flex justify-between items-start mt-2 mb-4">
                      <div className="flex items-center gap-2">
                        {room.is_official && <ShieldCheck className="w-5 h-5 text-primary" />}
                        <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase ${room.status === 'active' ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-primary/10 text-primary'}`}>
                          {room.status === 'active' ? 'Canlı Debat' : 'Gözləyir'}
                        </span>
                        <span className="text-xs font-bold bg-muted px-2 py-1 rounded-md uppercase">{room.lang}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs font-bold bg-muted/50 px-2.5 py-1.5 rounded-full border border-border">
                        👤 {partsCount} / {room.max_capacity}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-2">{room.title}</h3>
                    <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{room.topic}</p>

                    <div className="mt-auto pt-4 border-t border-border flex flex-col gap-3">
                      <div className="flex items-center gap-2 w-full">
                        {room.status === 'active' && (
                          <button 
                            onClick={() => openLiveChat(room.id)}
                            className="flex-1 py-2 bg-blue-500/10 text-blue-600 font-bold rounded-lg hover:bg-blue-500 hover:text-white transition-colors flex justify-center items-center gap-2 text-sm"
                          >
                            <Eye className="w-4 h-4" /> Canlı İzlə
                          </button>
                        )}
                        <button 
                          onClick={() => toggleStatus(room)}
                          className="flex-1 py-2 bg-orange-500/10 text-orange-600 font-bold rounded-lg hover:bg-orange-500 hover:text-white transition-colors flex justify-center items-center gap-2 text-sm"
                        >
                          <Power className="w-4 h-4" /> Deaktiv Et
                        </button>
                        <button 
                          onClick={() => handleDelete(room.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
                          title="Otağı Sil"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {ongoingRooms.length === 0 && (
                <div className="col-span-full py-10 text-center text-muted-foreground border border-dashed border-border rounded-3xl">
                  Hazırda aktiv və ya gözləyən otaq yoxdur.
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* TABLE SECTION */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">Keçmiş Turnirlər (Tarixçə)</h2>
              <button 
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" /> Excel-ə Çıxart
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground bg-muted/20">
                    <th className="py-3 px-4 font-bold rounded-tl-xl">Otaq Adı</th>
                    <th className="py-3 px-4 font-bold">Mövzu</th>
                    <th className="py-3 px-4 font-bold">Dil</th>
                    <th className="py-3 px-4 font-bold">Tutum</th>
                    <th className="py-3 px-4 font-bold">Tip</th>
                    <th className="py-3 px-4 font-bold rounded-tr-xl text-right">Keçirildiyi Tarix</th>
                  </tr>
                </thead>
                <tbody>
                  {finishedRooms.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">Tarixçə boşdur.</td>
                    </tr>
                  ) : (
                    finishedRooms.map((room) => (
                      <tr key={room.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-bold">{room.title}</td>
                        <td className="py-3 px-4 max-w-[200px] truncate">{room.topic}</td>
                        <td className="py-3 px-4 uppercase font-bold text-xs">{room.lang}</td>
                        <td className="py-3 px-4">{room.max_capacity} nəfər</td>
                        <td className="py-3 px-4">
                          {room.is_official ? <span className="text-primary font-bold">Rəsmi</span> : <span className="text-muted-foreground">Sərbəst</span>}
                        </td>
                        <td className="py-3 px-4 text-right text-muted-foreground">
                          {new Date(room.created_at).toLocaleString('az-AZ')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* CREATE MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground">
                <span className="text-2xl leading-none">&times;</span>
              </button>
              
              <h3 className="text-2xl font-bold mb-6">Yeni Rəsmi Otaq</h3>
              
              <form onSubmit={handleCreate} className="space-y-4">
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

                <div className="grid grid-cols-2 gap-4">
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
                      <option value={10}>10 Nəfər</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-muted-foreground uppercase">Dil</label>
                    <select 
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={newRoom.lang}
                      onChange={e => setNewRoom({...newRoom, lang: e.target.value})}
                    >
                      <option value="az">Azərbaycan</option>
                      <option value="en">İngilis</option>
                      <option value="ru">Rus</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-muted-foreground uppercase">Otaq Qaydaları</label>
                  <textarea 
                    required rows={3}
                    placeholder="Hər sətirə bir qayda..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    value={newRoom.rules}
                    onChange={e => setNewRoom({...newRoom, rules: e.target.value})}
                  />
                </div>

                <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-colors shadow-md mt-4">
                  Otağı Yarat
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIVE CHAT MODAL */}
      <AnimatePresence>
        {isChatModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[80vh]"
            >
              <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center justify-between shrink-0">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Canlı Çat İzləmə
                </h3>
                <button onClick={closeLiveChat} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
                  <span className="text-2xl leading-none">&times;</span>
                </button>
              </div>

              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4 bg-muted/5">
                {liveMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                    Söhbət hələ başlamayıb.
                  </div>
                ) : (
                  liveMessages.map((msg, idx) => {
                    const isSystem = !msg.user_id;
                    if (isSystem) {
                      return (
                        <div key={msg.id || idx} className="flex justify-center my-2">
                          <div className="bg-muted px-4 py-1.5 rounded-full text-xs text-muted-foreground font-medium">
                            {msg.text}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={msg.id || idx} className="flex justify-start">
                        <div className="max-w-[85%] items-start flex flex-col">
                          <div className="flex items-baseline gap-2 mb-1 px-1 flex-row">
                            <span className="text-xs font-bold text-primary">{msg.profiles?.first_name || 'İstifadəçi'} {msg.profiles?.last_name || ''}</span>
                            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-bold">{msg.role}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(msg.created_at).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>
                          <div className="px-4 py-2.5 text-sm shadow-sm bg-background border border-border rounded-2xl rounded-tl-sm text-foreground">
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
