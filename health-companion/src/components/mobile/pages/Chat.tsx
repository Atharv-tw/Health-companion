"use client";

import { useState, useEffect, useRef } from "react";
import { ThinkingOrb } from "@/components/chat/ThinkingOrb";
import { DataStreamMessage } from "@/components/chat/DataStreamMessage";
import { Send, ChevronLeft, ChevronDown, Stethoscope, Apple } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type ChatMode = "health" | "nutrition";

const CHAT_MODES = {
  health: {
    name: "Health Assistant",
    shortName: "Health",
    icon: Stethoscope,
    endpoint: "/api/chat",
    placeholder: "Ask about your health...",
    greeting: "Clinical systems online. Authenticated. How can I help?",
    color: "text-primary",
    bgColor: "bg-primary/5",
  },
  nutrition: {
    name: "Nutrition Advisor",
    shortName: "Nutrition",
    icon: Apple,
    endpoint: "/api/nutrition",
    placeholder: "Ask about nutrition...",
    greeting: "Nutrition Advisor ready. I can see your health data. How can I help with your diet?",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
};

export function MobileChat() {
  const [chatMode, setChatMode] = useState<ChatMode>("health");
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: CHAT_MODES.health.greeting }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentMode = CHAT_MODES[chatMode];
  const ModeIcon = currentMode.icon;

  useEffect(() => {
    if (scrollRef.current) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleModeSwitch = (mode: ChatMode) => {
    if (mode !== chatMode) {
      setChatMode(mode);
      setSessionId(null);
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
      setMessages(prev => [...prev, { role: "assistant", content: "Sync error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAF9]">
      {/* Header with Mode Selector */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-gray-100 flex items-center justify-between px-4 py-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>

        {/* Mode Selector */}
        <button
          onClick={() => setShowModeMenu(!showModeMenu)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-100 ${currentMode.bgColor}`}
        >
          <ModeIcon className={`w-4 h-4 ${currentMode.color}`} />
          <span className={`text-[11px] font-bold uppercase ${currentMode.color}`}>
            {currentMode.shortName}
          </span>
          <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${showModeMenu ? "rotate-180" : ""}`} />
        </button>

        <div className={`w-4 h-4 rounded-full ${currentMode.bgColor} flex items-center justify-center`}>
          <ModeIcon className={`w-3 h-3 ${currentMode.color}`} />
        </div>
      </div>

      {/* Mode Dropdown */}
      <AnimatePresence>
        {showModeMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setShowModeMenu(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-16 left-4 right-4 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-50"
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
                        {mode === "health" ? "General health guidance" : "Diet & nutrition advice"}
                      </span>
                    </div>
                    {isActive && (
                      <div className={`ml-auto w-2 h-2 rounded-full ${modeConfig.color.replace("text-", "bg-")}`} />
                    )}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
            placeholder={currentMode.placeholder}
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
