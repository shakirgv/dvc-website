"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Users, Send, UserPlus, Info, Mic, Video, Settings, Search, CheckCircle2, X } from "lucide-react";
import { MOCK_AUTH } from "@/lib/mock-auth";

export default function InnerRoomPage() {
  const params = useParams();
  const roomId = params?.id as string;
  const [session, setSession] = useState<any>(null);

  const [messages, setMessages] = useState([
    { id: 1, sender: "Sistem", text: "Otağa xoş gəldiniz! Debat 5 dəqiqə ərzində başlayacaq.", time: "12:00", isSystem: true }
  ]);
  const [input, setInput] = useState("");
  
  const [inviteId, setInviteId] = useState("");
  const [isInviteSent, setIsInviteSent] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Interactivity States
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [roomName, setRoomName] = useState("Yüklənir...");
  const [roomSettings, setRoomSettings] = useState({ timer: "3", topic: "Yüklənir...", rules: "Təhqirə yol verilmir" });

  const toggleMic = async () => {
    if (!isMicOn) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsMicOn(true);
      } catch (err) {
        alert("Mikrofona icazə verilmədi!");
      }
    } else {
      setIsMicOn(false);
    }
  };

  const toggleVideo = async () => {
    if (!isVideoOn) {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setIsVideoOn(true);
      } catch (err) {
        alert("Kameraya icazə verilmədi!");
      }
    } else {
      setIsVideoOn(false);
    }
  };

  useEffect(() => {
    setSession(MOCK_AUTH.getSession() || { firstName: "Qonaq", id: "DVC-Qonaq" });
    
    const OFFICIAL_ROOMS = [
      { id: "official-1", name: "Milli Turnir: Yarımfinal", topic: "Süni İntellekt Təhsil Sisteminə Zərərlidir" },
      { id: "official-2", name: "Həftəlik Debat", topic: "Karbondioksid vergiləri artırılmalıdır" },
    ];
    const saved = localStorage.getItem("dvc-user-rooms");
    const userRooms = saved ? JSON.parse(saved) : [];
    
    const foundRoom = OFFICIAL_ROOMS.find(r => r.id === roomId) || userRooms.find((r: any) => r.id === roomId);
    if (foundRoom) {
      setRoomName(foundRoom.name);
      setRoomSettings(prev => ({ ...prev, topic: foundRoom.topic }));
    } else {
      setRoomName("Müzakirə Otağı");
      setRoomSettings(prev => ({ ...prev, topic: "Sərbəst Mövzu" }));
    }
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages([...messages, {
      id: Date.now(),
      sender: `${session?.firstName} (${session?.id})`,
      text: input,
      time: new Date().toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' }),
      isSystem: false
    }]);
    setInput("");
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteId.trim()) return;
    
    // Simulate sending invite
    setIsInviteSent(true);
    setTimeout(() => setIsInviteSent(false), 3000);
    setInviteId("");
  };

  return (
    <div className="min-h-screen bg-background pt-20 px-4 pb-4">
      <div className="max-w-[1400px] mx-auto h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6">
        
        {/* LEFT PANEL - Board & Rules */}
        <div className="w-full md:w-1/3 lg:w-1/4 h-full flex flex-col gap-4">
          <Link href="/rooms" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" /> Lobbiyə qayıt
          </Link>
          
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex-1 flex flex-col">
            <h2 className="font-bold text-xl mb-2 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              {roomName}
            </h2>
            <p className="text-muted-foreground text-sm mb-6 pb-4 border-b border-border">
              Mövzu: {roomSettings.topic}
            </p>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" /> Qaydalar
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                <li className="flex gap-2"><span className="text-primary font-bold">1.</span> {roomSettings.rules}</li>
                <li className="flex gap-2"><span className="text-primary font-bold">2.</span> Hər çıxış üçün maksimum {roomSettings.timer} dəqiqə ayrılır.</li>
                <li className="flex gap-2"><span className="text-primary font-bold">3.</span> Fakt və rəqəmlərə əsaslanmaq mütləqdir.</li>
              </ul>

              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> İştirakçılar (2/4)
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/50 border border-border">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">M</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">Moderator (Sistem)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">S</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{session?.firstName} (Siz)</p>
                    <p className="text-[10px] text-muted-foreground">{session?.id}</p>
                  </div>
                </div>
              </div>
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
              {isInviteSent && <p className="text-xs text-green-500 mt-1.5">Dəvət göndərildi!</p>}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Real-time Chat */}
        <div className="flex-1 h-full bg-card border border-border rounded-3xl shadow-sm flex flex-col overflow-hidden relative">
          
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center justify-between shrink-0">
            <h2 className="font-bold text-lg">Canlı Müzakirə</h2>
            <div className="flex items-center gap-2">
              <button onClick={toggleMic} className={`p-2 rounded-lg transition-colors relative ${isMicOn ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}`}>
                <Mic className="w-5 h-5" />
                {isMicOn && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500 border border-card" />}
              </button>
              <button onClick={toggleVideo} className={`p-2 rounded-lg transition-colors relative ${isVideoOn ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}`}>
                <Video className="w-5 h-5" />
                {isVideoOn && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500 border border-card" />}
              </button>
              <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col max-w-[80%] ${msg.isSystem ? 'mx-auto text-center items-center' : msg.sender.includes('(Siz)') || msg.sender.includes(session?.id) ? 'self-end items-end' : 'self-start items-start'}`}>
                {!msg.isSystem && <span className="text-xs text-muted-foreground mb-1 px-1">{msg.sender} • {msg.time}</span>}
                <div className={`p-3.5 rounded-2xl text-[15px] ${
                  msg.isSystem 
                    ? 'bg-yellow-500/10 text-yellow-600/80 text-xs font-medium py-1.5 px-4 rounded-full' 
                    : msg.sender.includes('(Siz)') || msg.sender.includes(session?.id)
                      ? 'bg-primary text-white rounded-tr-none shadow-md shadow-primary/10'
                      : 'bg-muted text-foreground border border-border rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-border bg-background shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input 
                type="text" 
                className="flex-1 bg-muted/50 border border-border rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                placeholder="Mesajınızı yazın..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={!input.trim()}
                className="w-14 shrink-0 aspect-square bg-primary text-white rounded-2xl flex items-center justify-center hover:bg-primary-hover transition-colors shadow-md disabled:opacity-50"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-6 relative">
            <button onClick={() => setIsSettingsOpen(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-2xl font-bold mb-6">Otaq Parametrləri</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Taymer (Hər çıxış üçün)</label>
                <select className="w-full border border-border rounded-xl p-3 bg-background focus:ring-2 focus:ring-primary/50 outline-none" value={roomSettings.timer} onChange={(e) => setRoomSettings({...roomSettings, timer: e.target.value})}>
                  <option value="1">1 dəqiqə</option>
                  <option value="3">3 dəqiqə</option>
                  <option value="5">5 dəqiqə</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Mövzu</label>
                <input type="text" className="w-full border border-border rounded-xl p-3 bg-background focus:ring-2 focus:ring-primary/50 outline-none" value={roomSettings.topic} onChange={(e) => setRoomSettings({...roomSettings, topic: e.target.value})} />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Əsas Qayda</label>
                <input type="text" className="w-full border border-border rounded-xl p-3 bg-background focus:ring-2 focus:ring-primary/50 outline-none" value={roomSettings.rules} onChange={(e) => setRoomSettings({...roomSettings, rules: e.target.value})} />
              </div>

              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="w-full bg-primary text-white rounded-xl py-4 font-semibold hover:bg-primary-hover transition-colors mt-6 shadow-md"
              >
                Yadda Saxla
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
