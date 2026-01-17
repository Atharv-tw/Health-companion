"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShimmerBackground } from "@/components/ui/ShimmerBackground";
import { ThinkingOrb } from "@/components/chat/ThinkingOrb";
import { DataStreamMessage } from "@/components/chat/DataStreamMessage";
import { Send, Salad, Apple, Droplets, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const quickPrompts = [
  { label: "Balanced Diet", prompt: "Create a balanced daily meal plan for me", icon: Scale },
  { label: "Healthy Snacks", prompt: "Suggest healthy snack options between meals", icon: Apple },
  { label: "Hydration Tips", prompt: "How much water should I drink daily and tips to stay hydrated?", icon: Droplets },
  { label: "Meal Prep", prompt: "Give me easy meal prep ideas for the week", icon: Salad },
];

export function DesktopNutrition() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "### Nutrition Advisor Online.\nI'm here to help you with diet planning, healthy eating tips, and nutrition guidance. What would you like to know?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "SYNC_ERROR: Unable to connect to nutrition advisor." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden pl-24">
      <ShimmerBackground />

      {/* Top Bar */}
      <div className="w-full border-b border-gray-100 bg-white/40 backdrop-blur-md px-10 py-5 flex items-center justify-between z-30">
        <div className="flex items-center gap-8">
          <div className="w-4 hidden lg:block" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">Nutrition Advisor</span>
            <span className="text-base font-bold text-gray-900 tracking-tight uppercase">Diet & Wellness Module</span>
          </div>
          <div className="h-8 w-px bg-gray-100" />
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <span className="text-[11px] font-bold text-green-600 uppercase tracking-[0.2em]">Advisor Ready</span>
          </div>
        </div>

        <div className="flex gap-12">
          <MetaData label="Focus" value="Nutrition" icon={<Salad className="w-3.5 h-3.5" />} />
          <MetaData label="Mode" value="Personalized" icon={<Apple className="w-3.5 h-3.5" />} />
        </div>
      </div>

      {/* Message Stream */}
      <main className="flex-1 overflow-hidden relative">
        <div
          ref={scrollRef}
          className="h-full w-full overflow-y-auto no-scrollbar scroll-smooth px-10 md:px-20 lg:px-40 xl:px-60 pt-16 pb-60"
        >
          <div className="max-w-5xl mx-auto space-y-2">
            <div className="mb-20">
              <ThinkingOrb isThinking={isLoading} />
            </div>

            {/* Quick Prompts */}
            {messages.length === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-4 mb-8"
              >
                {quickPrompts.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(item.prompt)}
                    className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:border-primary/30 hover:shadow-lg transition-all group"
                  >
                    <div className="p-3 bg-primary/5 rounded-xl group-hover:bg-primary/10 transition-colors">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                  </button>
                ))}
              </motion.div>
            )}

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
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">Crafting Nutrition Plan...</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Input Bar */}
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
                  <Salad className="w-6 h-6" />
                </div>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about diet plans, nutrition tips, healthy meals..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-light py-5 px-6 placeholder:text-gray-300"
                />
                <Button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="h-14 px-10 rounded-2xl bg-gray-900 text-white hover:bg-black uppercase text-[11px] font-bold tracking-[0.2em] transition-all shadow-xl active:scale-95"
                >
                  Ask <Send className="ml-3 w-4 h-4" />
                </Button>
              </div>
            </motion.div>

            <p className="text-center mt-6 text-[9px] font-bold text-gray-400 uppercase tracking-[0.4em] opacity-50">
              Nutrition Advisor • Consult a Dietitian for Medical Nutrition Therapy
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function MetaData({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
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
