"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShimmerBackground } from "@/components/ui/ShimmerBackground";
import { ThinkingOrb } from "@/components/chat/ThinkingOrb";
import { DataStreamMessage } from "@/components/chat/DataStreamMessage";
import { Send, Sparkles, ShieldCheck, Activity, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function DesktopChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "### Oracle Link Established.\nReady to interpret your biological signals. How can I assist you?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "CRITICAL_ERROR: Synchronization interrupted." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden">
      <ShimmerBackground />
      
      {/* Immersive Top Bar - Edge to Edge */}
      <div className="w-full border-b border-gray-100 bg-white/40 backdrop-blur-md px-10 py-5 flex items-center justify-between z-30">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">Oracle Active Stream</span>
            <span className="text-base font-bold text-gray-900 tracking-tight uppercase">Core Interface v2.4</span>
          </div>
          <div className="h-8 w-px bg-gray-100" />
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <span className="text-[11px] font-bold text-green-600 uppercase tracking-[0.2em]">Secure Link Established</span>
          </div>
        </div>
        
        <div className="flex gap-12">
           <MetaData label="Latency" value="<240ms" icon={<Cpu className="w-3.5 h-3.5" />} />
           <MetaData label="Validation" value="Active" icon={<ShieldCheck className="w-3.5 h-3.5" />} />
           <MetaData label="System" value="Optimal" icon={<Activity className="w-3.5 h-3.5" />} />
        </div>
      </div>

      {/* Full Screen Message Stream */}
      <main className="flex-1 overflow-hidden relative">
        <div 
          ref={scrollRef}
          className="h-full w-full overflow-y-auto no-scrollbar scroll-smooth px-10 md:px-20 lg:px-40 xl:px-60 pt-16 pb-60"
        >
          <div className="max-w-5xl mx-auto space-y-2">
            <div className="mb-20">
              <ThinkingOrb isThinking={isLoading} />
            </div>
            
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <DataStreamMessage key={i} message={m} />
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 animate-pulse flex items-center gap-3"
              >
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">Oracle Synthesizing Response...</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Immersive Edge-to-Edge Input Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-10 z-40 bg-gradient-to-t from-[#FAFAF9] via-[#FAFAF9]/80 to-transparent">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] blur-3xl group-focus-within:bg-primary/10 transition-all opacity-50" />
              <div className="relative flex items-center bg-white border border-gray-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-2 pr-5">
                <div className="pl-8 text-primary/40 group-focus-within:text-primary transition-colors">
                  <Sparkles className="w-6 h-6" />
                </div>
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Describe your symptoms or query the clinical knowledge base..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-light py-5 px-6 placeholder:text-gray-300"
                />
                <Button 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="h-14 px-10 rounded-2xl bg-gray-900 text-white hover:bg-black uppercase text-[11px] font-bold tracking-[0.2em] transition-all shadow-xl active:scale-95"
                >
                  Query <Send className="ml-3 w-4 h-4" />
                </Button>
              </div>
            </motion.div>
            
            <p className="text-center mt-6 text-[9px] font-bold text-gray-400 uppercase tracking-[0.4em] opacity-50">
              Neural Council Active • HIPAA-Ready Protocol • Data Encrypted
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function MetaData({ label, value, icon }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-gray-400">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{label}</span>
        <span className="text-[11px] font-bold text-gray-900 uppercase tracking-tight">{value}</span>
      </div>
    </div>
  );
}
