"use client";

import { useState, useEffect, useRef } from "react";
import { ThinkingOrb } from "@/components/chat/ThinkingOrb";
import { DataStreamMessage } from "@/components/chat/DataStreamMessage";
import { Send, ChevronLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function MobileChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Clinical systems online. Authenticated. How can I help?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
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
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sync error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAF9]">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-gray-100 flex items-center justify-between px-6 py-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary">Oracle Node</span>
          <span className="text-[11px] font-bold text-gray-900 uppercase">Synchronized</span>
        </div>
        <div className="flex items-center text-green-500">
          <ShieldCheck className="w-4 h-4" />
        </div>
      </div>

      <main className="flex-1 pt-20 pb-40">
        <ThinkingOrb isThinking={isLoading} />
        
        <div ref={scrollRef} className="space-y-0">
          {messages.map((m, i) => (
            <DataStreamMessage key={i} message={m} />
          ))}
        </div>
      </main>

      <div className="fixed bottom-24 left-0 right-0 px-4 z-50">
        <div className="flex items-center gap-2 bg-white border border-gray-100 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.05)] rounded-2xl p-1.5 pl-5">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Subjective health query..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3"
          />
          <Button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="w-11 h-11 rounded-xl bg-gray-900 text-white shrink-0 shadow-lg"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
