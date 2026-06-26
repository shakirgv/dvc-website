"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Clock, Award, ShieldAlert, Zap, ArrowLeft, Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Message = { role: "user" | "model"; text: string };

function AIPartnerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  
  const rawTopic = searchParams.get("topic") || "";
  const side = searchParams.get("side") || "Təsdiq";
  
  const [topic, setTopic] = useState(rawTopic === "auto" ? "Generasiya olunur..." : rawTopic);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [round, setRound] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(120); // 2 mins per turn
  const [timerActive, setTimerActive] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, evaluation]);

  useEffect(() => {
    initDebate();
  }, []);

  const initDebate = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }
    setUserId(session.user.id);

    let finalTopic = rawTopic;
    if (rawTopic === "auto") {
      try {
        const res = await fetch("/api/gemini/debate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "generate_topic" })
        });
        const data = await res.json();
        finalTopic = data.topic;
        setTopic(finalTopic);
      } catch (err) {
        finalTopic = "Müasir dövrdə texnologiya insanları daha da tənha edir.";
        setTopic(finalTopic);
      }
    } else if (!rawTopic) {
      finalTopic = "Sosial şəbəkələr gənclərin inkişafına zərərlidir.";
      setTopic(finalTopic);
    }

    setMessages([
      { role: "model", text: `Salam! Mən sənin süni intellekt debat tərəfdaşınam (Gemini). \nMövzumuz: "${finalTopic}". \nSənin mövqeyin: ${side}. \n\nİlk arqumentini yazmaqla debata başla!` }
    ]);
    setIsInitializing(false);
    setTimerActive(true);
  };

  useEffect(() => {
    let interval: any = null;
    if (timerActive && timeLeft > 0 && !isFinished && !isLoading && !isInitializing) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isFinished && timerActive) {
      handleSend("Vaxtım bitdi, arqumentimi tamamlaya bilmədim.");
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, isFinished, isLoading, isInitializing]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSend = async (forcedText?: string) => {
    const textToSend = forcedText || input;
    if (!textToSend.trim() && !forcedText) return;

    const currentMessages = [...messages];
    const newMessages: Message[] = [...currentMessages, { role: "user", text: textToSend }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setTimerActive(false);

    try {
      const currentRound = round + 1;
      const willEvaluate = currentRound >= 3;
      
      const response = await fetch("/api/gemini/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          topic: topic,
          side: side,
          history: currentMessages,
          userMessage: textToSend
        })
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
      const updatedMessages: Message[] = [...newMessages, { role: "model", text: data.text }];
      setMessages(updatedMessages);
      setRound(currentRound);

      if (willEvaluate) {
        setIsFinished(true);
        setIsLoading(true); // Keep loading for final analysis
        
        // Analyze
        const evalRes = await fetch("/api/gemini/debate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "analyze",
            topic: topic,
            side: side,
            history: updatedMessages,
          })
        });
        
        const evalData = await evalRes.json();
        setEvaluation(evalData);
        
        // Save to Supabase
        await supabase.from("ai_debates").insert({
          user_id: userId,
          topic: topic,
          side: side,
          score: evalData.score || 0,
          feedback: evalData.feedback || "Feedback yoxdur"
        });

      } else {
        setTimeLeft(120); // reset timer
        setTimerActive(true);
      }
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: "model", text: "Bağışlayın, xəta baş verdi." }]);
      setTimerActive(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-lg font-medium">Debat otağı hazırlanır...</span>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background flex flex-col items-center py-8 px-4 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl flex items-center justify-between mb-6 z-10">
        <Link href="/az/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium">
          <ArrowLeft className="w-5 h-5" /> Geri qayıt
        </Link>
        <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full shadow-sm text-sm font-bold">
          <Bot className="w-4 h-4 text-primary" /> AI Partner
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="w-full max-w-4xl bg-card border border-border rounded-3xl shadow-xl overflow-hidden flex flex-col h-[75vh] z-10">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2">
                DVC AI Partner <Zap className="w-4 h-4 text-yellow-500" />
              </h2>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Gemini 2.5 Flash</span>
                <span>•</span>
                <span>Raund {Math.min(round + 1, 3)}/3</span>
                <span>•</span>
                <span>Mövqe: <strong className={side === "Təsdiq" ? "text-green-500" : "text-red-500"}>{side}</strong></span>
              </div>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg transition-colors shrink-0 ${timeLeft < 30 ? 'bg-red-500/10 text-red-500' : 'bg-muted text-foreground'}`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-primary text-white border border-primary/20'}`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-muted/50 border border-border text-foreground rounded-tl-none'
                }`}>
                  {msg.text.split('\n').map((line, i) => (
                    <span key={i}>{line}<br/></span>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && !evaluation && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-[80%]">
               <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 text-white">
                 <Bot className="w-5 h-5" />
               </div>
               <div className="p-4 rounded-2xl bg-muted/50 border border-border rounded-tl-none flex items-center gap-2">
                 <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                 <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                 <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
               </div>
             </motion.div>
          )}

          {/* Evaluation Block */}
          {evaluation && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 p-6 md:p-8 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-3xl mx-auto w-full max-w-2xl"
            >
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mb-4 shadow-xl shadow-green-500/20">
                  <Award className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">Debat Yekunlaşdı</h3>
                <div className="text-5xl font-black text-foreground mb-1">{evaluation.score}<span className="text-2xl text-muted-foreground font-medium">/100</span></div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Yekun Xal</p>
              </div>
              
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm text-left">
                <h4 className="font-bold flex items-center gap-2 mb-3"><ShieldAlert className="w-5 h-5 text-primary" /> AI Hakimin Rəyi</h4>
                <p className="text-foreground/80 leading-relaxed text-sm">
                  {evaluation.feedback}
                </p>
              </div>

              <div className="mt-6 flex justify-center">
                <Link href="/az/dashboard?tab=leaderboard" className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-hover transition-colors">
                  Reytinqə Bax
                </Link>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-muted/20">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-3 max-w-4xl mx-auto"
          >
            <input 
              type="text"
              placeholder={isFinished ? "Debat bitmişdir." : "Arqumentinizi yazın..."}
              className="flex-1 bg-background border border-border rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 transition-all"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isLoading || isFinished}
              autoFocus
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading || isFinished}
              className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-primary transition-all shadow-md shrink-0 group"
            >
              <Send className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
}

export default function AIPartnerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <AIPartnerContent />
    </Suspense>
  );
}
