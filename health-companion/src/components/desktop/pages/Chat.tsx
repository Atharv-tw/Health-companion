"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShimmerBackground } from "@/components/ui/ShimmerBackground";
import { ThinkingOrb } from "@/components/chat/ThinkingOrb";
import { DataStreamMessage } from "@/components/chat/DataStreamMessage";
import { Send, Sparkles, ChevronDown, Stethoscope, Apple, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type ChatMode = "health" | "nutrition" | "mental";

const CHAT_MODES = {
  health: {
    name: "Health Assistant",
    icon: Stethoscope,
    endpoint: "/api/chat",
    placeholder: "Describe your symptoms or query the clinical knowledge base...",
    greeting: "### Oracle Link Established.\nReady to interpret your biological signals. How can I assist you?",
    color: "text-primary",
    bgColor: "bg-primary/5",
    description: "General health guidance",
  },
  nutrition: {
    name: "Nutrition Advisor",
    icon: Apple,
    endpoint: "/api/nutrition",
    placeholder: "Ask about diet plans, nutrition tips, healthy meals...",
    greeting: "### Nutrition Advisor Online.\nI have access to your health logs and reports. How can I help with your diet?",
    color: "text-green-600",
    bgColor: "bg-green-50",
    description: "Diet & nutrition advice",
  },
  mental: {
    name: "Mental Wellness",
    icon: Brain,
    endpoint: "/api/mental-wellness",
    placeholder: "Share how you're feeling, ask about stress management...",
    greeting: "### Mental Wellness Support Active.\nI'm here to help with stress management and emotional well-being. How are you feeling today?",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    description: "Stress & emotional support",
  },
};

export function DesktopChat() {
  const [chatMode, setChatMode] = useState<ChatMode>("health");
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: CHAT_MODES.health.greeting }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentMode = CHAT_MODES[chatMode];
  const ModeIcon = currentMode.icon;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowModeMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleModeSwitch = (mode: ChatMode) => {
    if (mode !== chatMode) {
      setChatMode(mode);
      setSessionId(null); // Reset session for new mode
      setMessages([{ role: "assistant", content: CHAT_MODES[mode].greeting }]);
    }
    setShowModeMenu(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(currentMode.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, sessionId }),
      });

      const data = await response.json();
      if (data.sessionId) setSessionId(data.sessionId);
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "CRITICAL_ERROR: Synchronization interrupted." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden pl-24">
      <ShimmerBackground />

      {/* Top Bar with Mode Selector */}
      <div className="w-full border-b border-gray-100 bg-white/40 backdrop-blur-md px-10 py-5 flex items-center justify-between z-30">
        <div className="flex items-center gap-8">
          <div className="w-4 hidden lg:block" />

          {/* Mode Selector Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowModeMenu(!showModeMenu)}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl border border-gray-100 hover:border-gray-200 transition-all ${currentMode.bgColor}`}
            >
              <ModeIcon className={`w-5 h-5 ${currentMode.color}`} />
              <div className="flex flex-col items-start">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">Mode</span>
                <span className={`text-sm font-bold uppercase tracking-tight ${currentMode.color}`}>
                  {currentMode.name}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showModeMenu ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showModeMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  {(Object.keys(CHAT_MODES) as ChatMode[]).map((mode) => {
                    const modeConfig = CHAT_MODES[mode];
                    const Icon = modeConfig.icon;
                    const isActive = mode === chatMode;

                    return (
                      <button
                        key={mode}
                        onClick={() => handleModeSwitch(mode)}
                        className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors ${
                          isActive ? modeConfig.bgColor : ""
                        }`}
                      >
                        <div className={`p-2 rounded-xl ${modeConfig.bgColor}`}>
                          <Icon className={`w-5 h-5 ${modeConfig.color}`} />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className={`text-sm font-bold ${isActive ? modeConfig.color : "text-gray-900"}`}>
                            {modeConfig.name}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {modeConfig.description}
                          </span>
                        </div>
                        {isActive && (
                          <div className={`ml-auto w-2 h-2 rounded-full ${modeConfig.color.replace("text-", "bg-")}`} />
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-8 w-px bg-gray-100" />
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            <span className="text-[11px] font-bold text-green-600 uppercase tracking-[0.2em]">Secure Link Established</span>
          </div>
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
                <div className={`w-2 h-2 rounded-full ${currentMode.color.replace("text-", "bg-")}`} />
                <span className={`text-[11px] font-bold uppercase tracking-[0.3em] ${currentMode.color}`}>
                  {chatMode === "nutrition" ? "Crafting Nutrition Plan..." :
                   chatMode === "mental" ? "Processing Wellness Response..." :
                   "Oracle Synthesizing Response..."}
                </span>
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
                <div className={`pl-8 ${currentMode.color} opacity-40 group-focus-within:opacity-100 transition-colors`}>
                  <ModeIcon className="w-6 h-6" />
                </div>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={currentMode.placeholder}
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
              {chatMode === "nutrition"
                ? "Nutrition Advisor • Reads Your Health Data • Consult a Dietitian"
                : chatMode === "mental"
                ? "Mental Wellness • Stress Management • Consult a Professional"
                : "Neural Council Active • HIPAA-Ready Protocol • Data Encrypted"}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
