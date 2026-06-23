"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Clock, Award, ShieldAlert, Zap, RefreshCcw } from "lucide-react";

type Message = { role: "user" | "model"; text: string };

export default function AIPartnerPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Salam! Mən sənin süni intellekt debat tərəfdaşınam (Gemini 1.5). Mövzumuz: 'Sosial şəbəkələr gənclərin inkişafına zərərlidir'. Sən bu fikri təsdiqləyirsən (Təsdiq), yoxsa inkar edirsən (İnkar)?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [round, setRound] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [evaluation, setEvaluation] = useState<string | null>(null);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(120); // 2 mins per turn
  const [timerActive, setTimerActive] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, evaluation]);

  useEffect(() => {
    let interval: any = null;
    if (timerActive && timeLeft > 0 && !isFinished && !isLoading) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSend("Vaxtım bitdi...");
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, isFinished, isLoading]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSend = async (forcedText?: string) => {
    const textToSend = forcedText || input;
    if (!textToSend.trim() && !forcedText) return;

    const newMessages: Message[] = [...messages, { role: "user", text: textToSend }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setTimerActive(false);

    try {
      const currentRound = round + 1;
      const willEvaluate = currentRound >= 3;
      
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: messages,
          currentMessage: textToSend,
          isEvaluation: willEvaluate
        })
      });

      const data = await response.json();

      if (willEvaluate) {
        setEvaluation(data.reply);
        setIsFinished(true);
        
        // Phase 3.5: Save to AI History for Leaderboard
        const savedHistory = localStorage.getItem("dvc-ai-history");
        const history = savedHistory ? JSON.parse(savedHistory) : [];
        const scoreMatch = data.reply.match(/(\d{2,3})\s*\/\s*100/) || data.reply.match(/(\d{2,3})/);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : Math.floor(Math.random() * 30 + 70); // fallback if no clear number
        history.unshift({
          id: Date.now(),
          date: new Date().toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' }),
          topic: "Sosial şəbəkələr gənclərin inkişafına zərərlidir",
          score,
          evaluation: data.reply
        });
        localStorage.setItem("dvc-ai-history", JSON.stringify(history));
        
      } else {
        setMessages([...newMessages, { role: "model", text: data.reply }]);
        setRound(currentRound);
        setTimeLeft(120); // reset timer
        setTimerActive(true);
      }
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: "model", text: "Bağışlayın, şəbəkə xətası baş verdi." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-10 px-4">
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-120px)]">
        
        {/* Header & Timer */}
        <div className="bg-card border border-border rounded-t-3xl p-4 md:p-6 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center relative">
              <Bot className="w-6 h-6 text-primary" />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />
            </div>
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2">
                DVC AI Partner <Zap className="w-4 h-4 text-yellow-500" />
              </h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> Gemini 1.5 Flash - Raund {round}/3
              </p>
            </div>
          </div>

          {!isFinished && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xl font-bold transition-colors ${
              timeLeft < 30 ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"
            }`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-muted/20 border-x border-border p-4 md:p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6 relative">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" 
               style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }} />

          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
            >
              <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${
                msg.role === 'user' ? 'bg-primary text-white' : 'bg-card border border-border shadow-sm'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-primary" />}
              </div>
              <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-card border border-border rounded-tl-none text-foreground'
              }`}>
                {msg.text}
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <div className="self-start flex gap-4 max-w-[85%]">
              <div className="w-10 h-10 rounded-full shrink-0 bg-card border border-border shadow-sm flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div className="p-4 rounded-2xl bg-card border border-border rounded-tl-none flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {/* Evaluation Score Panel */}
          <AnimatePresence>
            {isFinished && evaluation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full mt-4 bg-gradient-to-br from-card to-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden"
              >
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center gap-3 mb-6">
                  <Award className="w-8 h-8 text-yellow-500" />
                  <h3 className="text-2xl font-bold">Debat Nəticəsi (AI Analizi)</h3>
                </div>
                
                <div className="prose dark:prose-invert max-w-none mb-8 whitespace-pre-wrap leading-relaxed text-sm">
                  {evaluation}
                </div>

                <button 
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors shadow-md"
                >
                  <RefreshCcw className="w-5 h-5" /> Yeni Debata Başla
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-card border border-border rounded-b-3xl p-4 shrink-0 shadow-sm relative z-10">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-3 relative"
          >
            <input
              disabled={isLoading || isFinished}
              type="text"
              className="flex-1 bg-background border border-border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow pr-14 disabled:opacity-50"
              placeholder={isFinished ? "Debat bitmişdir." : "Arqumentinizi yazın..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading || isFinished}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-primary transition-colors"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
