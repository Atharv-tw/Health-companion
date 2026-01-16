"use client";

import { useState, useEffect, useRef } from "react";
import { ThinkingOrb } from "@/components/chat/ThinkingOrb";
import { DataStreamMessage } from "@/components/chat/DataStreamMessage";
import { Send, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function MobileChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Clinical systems online. How can I help you?" }
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
      {/* Mobile Top Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-6 py-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <span className="font-bold text-[10px] uppercase tracking-[0.3em] text-gray-400">Oracle Stream</span>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <main className="flex-1 pt-24 pb-32">
        <ThinkingOrb isThinking={isLoading} />
        
        <div ref={scrollRef} className="space-y-2">
          {messages.map((m, i) => (
            <DataStreamMessage key={i} message={m} />
          ))}
        </div>
      </main>

      {/* Mobile Command Bar */}
      <div className="fixed bottom-24 left-0 right-0 px-4 z-50">
        <div className="flex items-center gap-2 bg-white border border-gray-100 shadow-2xl rounded-full p-1.5 pl-6">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type health query..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2"
          />
          <Button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="w-10 h-10 rounded-full bg-gray-900 text-white shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
