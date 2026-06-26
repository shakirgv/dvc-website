"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, Send, UserPlus, Info, Settings, Search, CheckCircle2, X, Lock, PlayCircle, Loader2, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function InnerRoomPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || "az";
  const roomId = params?.id as string;
  const supabase = createClient();

  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Room State
  const [room, setRoom] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  // Local Chat State
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Invite
  const [inviteId, setInviteId] = useState("");
  const [isInviteSent, setIsInviteSent] = useState(false);

  // Modals
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Settings State (for creator)
  const [editRules, setEditRules] = useState<string[]>([]);
  const [editType, setEditType] = useState("public");
  const [editCode, setEditCode] = useState("");

  // Turn-based State
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [timerActive, setTimerActive] = useState(false);

  const roles = ["Təsdiq 1", "İnkar 1", "Təsdiq 2", "İnkar 2", "Təsdiq 3", "İnkar 3"];

  useEffect(() => {
    initRoom();

    const roomChannel = supabase.channel(`room:${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload) => {
        setRoom(payload.new);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_participants', filter: `room_id=eq.${roomId}` }, () => {
        fetchParticipants();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'room_messages', filter: `room_id=eq.${roomId}` }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    const handleBeforeUnload = async () => {
      if (session?.user?.id) {
        // Will fire on tab close, but modern browsers don't guarantee async fetch here
        // Usually presence is better, but we stick to DB for simplicity
        navigator.sendBeacon(`/api/leave-room?room_id=${roomId}&user_id=${session.user.id}`);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      supabase.removeChannel(roomChannel);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      leaveRoom();
    };
  }, [roomId, session?.user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  // Turn-Based Timer Logic
  useEffect(() => {
    let interval: any = null;
    if (room?.status === 'active' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (room?.status === 'active' && timeLeft === 0) {
      // Time is up, auto next turn
      handleNextTurn();
    }
    return () => clearInterval(interval);
  }, [room?.status, timeLeft, room?.current_speaker_index]);

  // Reset timer when speaker changes
  useEffect(() => {
    setTimeLeft(180);
  }, [room?.current_speaker_index]);

  const initRoom = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push(`/${locale}/login`);
      return;
    }
    setSession(session);

    // Fetch Profile
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    setProfile(prof);

    // Fetch Room
    const { data: roomData } = await supabase.from('rooms').select('*').eq('id', roomId).single();
    if (!roomData) {
      router.push(`/${locale}/rooms`);
      return;
    }
    setRoom(roomData);
    setEditRules(roomData.rules || []);
    setEditType(roomData.room_type || 'public');
    setEditCode(roomData.room_code || '');

    // Fetch Messages
    const { data: rawMsgs, error: msgsErr } = await supabase.from('room_messages').select('*').eq('room_id', roomId).order('created_at', { ascending: true });
    
    // Fetch Participants
    const { data: rawParts, error: partsErr } = await supabase.from('room_participants').select('*').eq('room_id', roomId).order('joined_at', { ascending: true });
    
    if (msgsErr) console.error("Error fetching messages:", msgsErr);
    if (partsErr) console.error("Error fetching parts:", partsErr);

    // Fetch Profiles manually
    const userIds = new Set<string>();
    if (rawMsgs) rawMsgs.forEach(m => { if (m.user_id) userIds.add(m.user_id); });
    if (rawParts) rawParts.forEach(p => { if (p.user_id) userIds.add(p.user_id); });
    
    let profMap: any = {};
    if (userIds.size > 0) {
      const { data: profs } = await supabase.from('profiles').select('id, first_name, last_name, dvc_id').in('id', Array.from(userIds));
      if (profs) profMap = profs.reduce((acc: any, p: any) => { acc[p.id] = p; return acc; }, {});
    }

    if (rawMsgs) {
      rawMsgs.forEach(m => { m.profiles = profMap[m.user_id]; });
      setMessages(rawMsgs);
    }
    
    if (rawParts) {
      rawParts.forEach(p => { p.profiles = profMap[p.user_id]; });
      setParticipants(rawParts);
      
      const isParticipant = rawParts.find((p: any) => p.user_id === session.user.id);
      if (!isParticipant) {
        if (rawParts.length >= roomData.max_capacity) {
          alert("Otaq artıq doludur. Yalnız izləyici kimi qala bilərsiniz.");
          setIsLoading(false);
        } else {
          setIsRoleModalOpen(true);
        }
      } else {
        setIsLoading(false);
      }
    } else {
      // If error or no parts, stop loading
      setIsLoading(false);
    }
  };

  const fetchParticipants = async () => {
    const { data: rawParts } = await supabase.from('room_participants')
      .select('*')
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true });
      
    if (rawParts) {
      const userIds = [...new Set(rawParts.map(p => p.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        const { data: profs } = await supabase.from('profiles').select('id, first_name, last_name, dvc_id').in('id', userIds);
        if (profs) {
          const profMap = profs.reduce((acc: any, p: any) => { acc[p.id] = p; return acc; }, {});
          rawParts.forEach(p => { p.profiles = profMap[p.user_id]; });
        }
      }
      setParticipants(rawParts);
    }
  };

  const leaveRoom = async () => {
    if (session?.user?.id) {
      await supabase.from('room_participants').delete().match({ room_id: roomId, user_id: session.user.id });
    }
  };

  const handleJoinRole = async (role: string) => {
    if (!session) return;
    const { error } = await supabase.from('room_participants').insert({
      room_id: roomId,
      user_id: session.user.id,
      assigned_role: role
    });
    if (!error) {
      setIsRoleModalOpen(false);
      setIsLoading(false);
      fetchParticipants();
      
      // System Message
      await supabase.from('room_messages').insert({
        room_id: roomId,
        text: `${profile?.first_name} ${profile?.last_name} (${role}) otağa qoşuldu.`
      });
    } else {
      alert("Xəta: Bu rol artıq tutulub və ya başqa problem var.");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !session || !profile) return;
    
    const myPart = participants.find(p => p.user_id === session.user.id);
    const roleName = myPart ? myPart.assigned_role : "İzləyici";

    const { error } = await supabase.from('room_messages').insert({
      room_id: roomId,
      user_id: session.user.id,
      role: roleName,
      text: input
    });
    
    if (!error) {
      setInput("");
      // End Turn automatically if they send a message during their turn
      if (room?.status === 'active' && currentSpeakerRole === myPart?.assigned_role) {
        handleNextTurn();
      }
    }
  };

  const handleNextTurn = async () => {
    if (!room || room.status !== 'active') return;
    
    const nextIndex = room.current_speaker_index + 1;
    if (nextIndex >= room.max_capacity) {
      // Finish debate
      await supabase.from('rooms').update({ status: 'finished' }).eq('id', roomId);
      await supabase.from('room_messages').insert({
        room_id: roomId,
        text: `DEBAT YEKUNLAŞDI! Bütün çıxışlar tamamlandı.`
      });
    } else {
      await supabase.from('rooms').update({ current_speaker_index: nextIndex }).eq('id', roomId);
    }
  };

  const handleStartDebate = async () => {
    if (participants.length < room.max_capacity) {
      alert("Debatı başlatmaq üçün otaq tam dolmalıdır.");
      return;
    }
    await supabase.from('rooms').update({ status: 'active', current_speaker_index: 0 }).eq('id', roomId);
    await supabase.from('room_messages').insert({
      room_id: roomId,
      text: `DEBAT BAŞLADI! İlk söz haqqı: ${roles[0]}`
    });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('rooms').update({
      rules: editRules.filter(r => r.trim() !== ""),
      room_type: editType,
      room_code: editType === 'private' ? editCode : null
    }).eq('id', roomId);
    setIsSettingsOpen(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteId.trim() || !session || !profile) return;
    
    // Find user by DVC ID
    const { data: targetUser } = await supabase.from('profiles').select('id').eq('dvc_id', inviteId).single();
    if (!targetUser) {
      alert("Bu DVC ID ilə istifadəçi tapılmadı.");
      return;
    }

    // Insert into notifications
    await supabase.from('notifications').insert({
      title: "Otaq Dəvəti",
      content: `${profile.first_name} ${profile.last_name} sizi debat otağına dəvət edir.`,
      type: "info",
      action_text: "Otağa Qoşul",
      action_url: `/${locale}/rooms/${roomId}`,
      target_user_ids: [targetUser.id]
    });

    setIsInviteSent(true);
    setTimeout(() => setIsInviteSent(false), 3000);
    setInviteId("");
  };

  if (isLoading || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isCreator = session?.user?.id === room?.creator_id;
  const myParticipant = participants.find(p => p.user_id === session?.user?.id);
  const currentSpeakerRole = roles[room?.current_speaker_index || 0];
  const isMyTurn = room?.status === 'active' && myParticipant?.assigned_role === currentSpeakerRole;
  
  // Can chat if it's waiting/finished, OR if it's active and it's their turn
  const canChat = room?.status !== 'active' || isMyTurn;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-background pt-20 px-4 pb-4 relative overflow-hidden">
      
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1400px] mx-auto h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6 relative z-10">
        
        {/* LEFT PANEL - Board & Rules */}
        <div className="w-full md:w-1/3 lg:w-1/4 h-full flex flex-col gap-4">
          <Link href={`/${locale}/rooms`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" /> Lobbiyə qayıt
          </Link>
          
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h2 className="font-bold text-xl flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${room.status === 'active' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                {room.title}
              </h2>
              {room.room_type === 'private' && <Lock className="w-4 h-4 text-yellow-500 shrink-0" />}
            </div>
            
            <p className="text-muted-foreground text-sm mb-6 pb-4 border-b border-border">
              Mövzu: <span className="font-semibold text-foreground">{room.topic}</span>
            </p>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" /> Qaydalar
                </h3>
              </div>
              
              <ul className="space-y-3 text-sm text-muted-foreground mb-8 bg-muted/30 p-4 rounded-2xl border border-border">
                {room.rules?.map((rule: string, idx: number) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-primary font-bold">{idx + 1}.</span> {rule}
                  </li>
                ))}
              </ul>

              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> İştirakçılar ({participants.length}/{room.max_capacity})
              </h3>
              <div className="space-y-2 mb-6">
                {participants.map((p) => (
                  <div key={p.id} className={`flex items-center gap-3 p-2.5 rounded-xl border ${p.user_id === session?.user?.id ? 'bg-primary/5 border-primary/20' : 'bg-muted/50 border-border'} ${currentSpeakerRole === p.assigned_role && room.status === 'active' ? 'ring-2 ring-primary bg-primary/10' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${p.user_id === session?.user?.id ? 'bg-primary text-white' : 'bg-primary/20 text-primary'}`}>
                      {p.profiles?.first_name?.[0]}{p.profiles?.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {p.profiles?.first_name} {p.profiles?.last_name} {p.user_id === session?.user?.id && '(Siz)'}
                      </p>
                      <p className="text-[10px] font-bold text-primary">{p.assigned_role}</p>
                    </div>
                  </div>
                ))}
                
                {/* Empty Slots */}
                {Array.from({ length: room.max_capacity - participants.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="flex items-center gap-3 p-2.5 rounded-xl border border-dashed border-border bg-transparent opacity-50">
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">?</div>
                    <p className="text-sm font-medium text-muted-foreground">Boş yer</p>
                  </div>
                ))}
              </div>

              {isCreator && room.status === 'waiting' && (
                <button 
                  onClick={handleStartDebate}
                  disabled={participants.length < room.max_capacity}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl font-bold shadow-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                  <PlayCircle className="w-5 h-5" /> Debatı Başlat
                </button>
              )}
            </div>

            {/* Invite Section */}
            <div className="pt-4 border-t border-border mt-4">
              <h4 className="font-medium text-sm mb-2">DVC ID ilə Dəvət et</h4>
              <form onSubmit={handleInvite} className="flex gap-2 relative">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="DVC-2026-XXXX" 
                    className="w-full bg-background border border-border rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={inviteId}
                    onChange={(e) => setInviteId(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={!inviteId || isInviteSent} className="px-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50">
                  {isInviteSent ? <CheckCircle2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                </button>
              </form>
              {isInviteSent && <p className="text-xs text-green-500 mt-1.5 font-medium">Dəvət göndərildi!</p>}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Real-time Chat */}
        <div className="flex-1 h-full bg-card border border-border rounded-3xl shadow-sm flex flex-col overflow-hidden relative">
          
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center justify-between shrink-0">
            <div>
              <h2 className="font-bold text-lg">Canlı Müzakirə</h2>
              <p className="text-xs text-muted-foreground">Otaq ID: {roomId.split('-')[0]}</p>
            </div>
            
            <div className="flex items-center gap-4">
              {room.status === 'active' && (
                <div className="flex items-center gap-3 px-4 py-1.5 bg-background border border-border rounded-full shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-bold">{currentSpeakerRole} çıxış edir...</span>
                  <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">{formatTime(timeLeft)}</span>
                </div>
              )}

              {isCreator && (
                <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-lg bg-background border border-border hover:bg-muted text-muted-foreground transition-colors shadow-sm">
                  <Settings className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                <MessageSquare className="w-12 h-12 mb-4" />
                <p>Mesaj yoxdur. Söhbətə ilk siz başlayın!</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.user_id === session?.user?.id;
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
                  <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`flex items-baseline gap-2 mb-1 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-xs font-bold">{msg.profiles?.first_name || 'İstifadəçi'}</span>
                        <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-bold">{msg.role}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(msg.created_at).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`px-5 py-3 text-sm shadow-sm ${
                        isMe 
                          ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm' 
                          : 'bg-muted rounded-2xl rounded-tl-sm text-foreground'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-muted/20 border-t border-border">
            <form onSubmit={handleSendMessage} className="relative flex items-center">
              <input 
                type="text" 
                placeholder={room.status === 'active' && !isMyTurn ? "Sizin növbəniz deyil..." : "Mesajınızı yazın..."}
                className="w-full bg-background border border-border rounded-2xl py-4 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm disabled:opacity-50"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={!canChat}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || !canChat}
                className="absolute right-3 p-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* ROLE SELECTION MODAL */}
      <AnimatePresence>
        {isRoleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-8 relative"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Rolunuzu Seçin</h3>
                <p className="text-muted-foreground text-sm">Otağa daxil olmaq üçün debatı hansı mövqedən aparacağınızı seçin.</p>
              </div>

              <div className="space-y-3">
                {roles.slice(0, room?.max_capacity).map((role) => {
                  const isTaken = participants.some(p => p.assigned_role === role);
                  return (
                    <button
                      key={role}
                      onClick={() => handleJoinRole(role)}
                      disabled={isTaken}
                      className={`w-full p-4 rounded-xl border-2 flex justify-between items-center transition-all ${
                        isTaken 
                          ? 'border-border bg-muted text-muted-foreground opacity-60 cursor-not-allowed' 
                          : 'border-primary/20 bg-background hover:border-primary hover:bg-primary/5 shadow-sm'
                      }`}
                    >
                      <span className="font-bold">{role}</span>
                      {isTaken && <span className="text-xs bg-border px-2 py-1 rounded font-medium">Seçilib</span>}
                    </button>
                  );
                })}
                
                <button 
                  onClick={() => { setIsRoleModalOpen(false); setIsLoading(false); }}
                  className="w-full mt-4 p-4 rounded-xl text-muted-foreground font-medium hover:bg-muted transition-colors"
                >
                  Yalnız İzləyici Kimi Davam Et
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SETTINGS MODAL (Creator Only) */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button onClick={() => setIsSettingsOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><Settings className="w-6 h-6 text-primary" /> Otaq Parametrləri</h3>
              
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Otaq Tipi</label>
                  <select 
                    className="w-full border border-border rounded-xl p-3 bg-background focus:ring-2 focus:ring-primary/50 outline-none" 
                    value={editType} 
                    onChange={(e) => setEditType(e.target.value)}
                  >
                    <option value="public">Açıq (Public)</option>
                    <option value="private">Gizli (Private)</option>
                  </select>
                </div>

                {editType === 'private' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Otaq Şifrəsi</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full border border-border rounded-xl p-3 bg-background focus:ring-2 focus:ring-primary/50 outline-none" 
                      value={editCode} 
                      onChange={(e) => setEditCode(e.target.value)} 
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Qaydalar (Hər sətirə bir qayda)</label>
                  <textarea 
                    className="w-full min-h-[150px] border border-border rounded-xl p-3 bg-background focus:ring-2 focus:ring-primary/50 outline-none resize-none" 
                    value={editRules.join('\n')}
                    onChange={(e) => setEditRules(e.target.value.split('\n'))}
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-primary text-white rounded-xl py-4 font-semibold hover:bg-primary-hover transition-colors mt-6 shadow-md"
                >
                  Yadda Saxla
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
