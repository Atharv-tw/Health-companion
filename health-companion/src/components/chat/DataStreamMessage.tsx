"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { User, Sparkles, Database } from "lucide-react";

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="w-full"
    >
      <div className={cn(
        "group flex flex-col gap-3 p-6 transition-colors",
        isAI ? "bg-white/40 border-y border-gray-100/50" : "bg-transparent"
      )}>
        {/* Role Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center border",
              isAI ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white text-gray-400 border-gray-200"
            )}>
              {isAI ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-[0.2em]",
              isAI ? "text-primary" : "text-gray-400"
            )}>
              {isAI ? "Clinical Intelligence Output" : "Subjective Input"}
            </span>
          </div>
          {isAI && (
            <div className="flex items-center gap-2 px-2 py-1 bg-green-50 rounded-md border border-green-100">
              <Database className="w-3 h-3 text-green-600" />
              <span className="text-[9px] font-bold text-green-700 uppercase tracking-tighter">Verified RAG-8</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={cn(
          "pl-11 prose prose-sm max-w-none",
          isAI ? "text-gray-800 font-light" : "text-gray-500 font-normal"
        )}>
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}