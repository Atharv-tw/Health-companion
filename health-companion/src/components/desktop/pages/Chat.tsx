"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShimmerBackground } from "@/components/ui/ShimmerBackground";
import { ThinkingOrb } from "@/components/chat/ThinkingOrb";
import { DataStreamMessage } from "@/components/chat/DataStreamMessage";
import { Send, Sparkles, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function DesktopChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "# Welcome to the Oracle.\nHow can I assist your health journey today?" }
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
      setMessages(prev => [...prev, { role: "assistant", content: "Protocol error. Unable to synchronize with the Oracle." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center">
      <ShimmerBackground />
      
      {/* Fixed Header within Chat */}
      <div className="w-full max-w-4xl pt-8 pb-4 text-center">
        <ThinkingOrb isThinking={isLoading} />
      </div>

      {/* Main Stream Area */}
      <div 
        ref={scrollRef}
        className="flex-1 w-full max-w-4xl overflow-y-auto no-scrollbar px-4 pt-10 pb-40 space-y-4"
      >
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <DataStreamMessage key={i} message={m} />
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start px-4"
          >
            <div className="bg-white/40 backdrop-blur-md border border-white/60 p-6 rounded-[2.5rem] rounded-tl-sm animate-pulse">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Floating Command Bar */}
      <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-40">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] blur-2xl group-focus-within:bg-primary/10 transition-all" />
          <div className="relative flex items-center bg-white/70 backdrop-blur-3xl border border-white shadow-2xl rounded-[2.5rem] p-2 pr-4">
            <div className="pl-6 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Query the Health Oracle..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-light py-4 px-4 placeholder:text-gray-300"
            />
            <Button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="w-12 h-12 rounded-full bg-gray-900 text-white hover:bg-black shadow-xl shrink-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
