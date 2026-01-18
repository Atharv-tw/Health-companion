"use client";

import { useState, useEffect, useRef } from "react";
import { ThinkingOrb } from "@/components/chat/ThinkingOrb";
import { DataStreamMessage } from "@/components/chat/DataStreamMessage";
import { Send, ChevronLeft, Salad, Apple, Droplets, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const quickPrompts = [
  { label: "Balanced Diet", prompt: "Create a balanced daily meal plan for me", icon: Scale },
  { label: "Healthy Snacks", prompt: "Suggest healthy snack options", icon: Apple },
  { label: "Hydration", prompt: "Tips to stay hydrated?", icon: Droplets },
  { label: "Meal Prep", prompt: "Easy meal prep ideas", icon: Salad },
];

export function MobileNutrition() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Nutrition Advisor ready. How can I help with your diet?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async (customMessage?: string) => {
    const messageToSend = customMessage || input.trim();
    if (!messageToSend || isLoading) return;

    if (!customMessage) setInput("");
    setMessages(prev => [...prev, { role: "user", content: messageToSend }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend, sessionId }),
      });

      const data = await response.json();
      if (data.sessionId) setSessionId(data.sessionId);
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAF9] dark:bg-slate-950">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-6 py-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-green-600 dark:text-green-400">Nutrition</span>
          <span className="text-[11px] font-bold text-gray-900 dark:text-gray-50 uppercase">Advisor</span>
        </div>
        <div className="flex items-center text-green-500 dark:text-green-400">
          <Salad className="w-4 h-4" />
        </div>
      </div>

      <main className="flex-1 pt-20 pb-40">
        <ThinkingOrb isThinking={isLoading} />

        {/* Quick Prompts */}
        {messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-3 px-4 mb-6"
          >
            {quickPrompts.map((item, i) => (
              <button
                key={i}
                onClick={() => handleSend(item.prompt)}
                className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl hover:border-primary/30 dark:hover:border-primary/30 transition-all"
              >
                <item.icon className="w-5 h-5 text-primary" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{item.label}</span>
              </button>
            ))}
          </motion.div>
        )}

        <div ref={scrollRef} className="space-y-0">
          {messages.map((m, i) => (
            <DataStreamMessage key={i} message={m} />
          ))}
        </div>
      </main>

      <div className="fixed bottom-24 left-0 right-0 px-4 z-50">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.05)] rounded-2xl p-1.5 pl-5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about nutrition..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 text-gray-900 dark:text-gray-50 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <Button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="w-11 h-11 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shrink-0 shadow-lg"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
