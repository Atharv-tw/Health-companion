"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface DataStreamMessageProps {
  message: Message;
  delay?: number;
}

export function DataStreamMessage({ message, delay = 0 }: DataStreamMessageProps) {
  const isAI = message.role === "assistant";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "flex w-full mb-8 px-4",
        isAI ? "justify-start" : "justify-end"
      )}
    >
      <div 
        className={cn(
          "max-w-[85%] md:max-w-[70%] p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden",
          isAI 
            ? "bg-white/80 backdrop-blur-md border border-white/60 text-gray-800 rounded-tl-sm" 
            : "bg-gray-100/50 backdrop-blur-sm border border-gray-200/50 text-gray-700 rounded-tr-sm"
        )}
      >
        {/* Subtle Glow for AI Messages */}
        {isAI && (
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-blue-400/20 to-transparent" />
        )}

        <div className="prose prose-sm prose-slate max-w-none prose-p:leading-relaxed">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>

        {/* Timestamp/Label */}
        <div className={cn(
          "text-[9px] font-bold uppercase tracking-widest mt-4 opacity-40",
          isAI ? "text-primary" : "text-gray-500"
        )}>
          {isAI ? "Oracle Output" : "User Input"}
        </div>
      </div>
    </motion.div>
  );
}
