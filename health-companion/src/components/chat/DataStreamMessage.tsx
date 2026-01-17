"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { User, Sparkles } from "lucide-react";

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
        isAI ? "bg-white/40 dark:bg-gray-800/40 border-y border-gray-100/50 dark:border-gray-700/50" : "bg-transparent"
      )}>
        {/* Role Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center border",
              isAI ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white dark:bg-gray-700 text-gray-400 dark:text-gray-300 border-gray-200 dark:border-gray-600"
            )}>
              {isAI ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-[0.2em]",
              isAI ? "text-primary" : "text-gray-400 dark:text-gray-500"
            )}>
              {isAI ? "Clinical Intelligence Output" : "Subjective Input"}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className={cn(
          "pl-11 prose prose-sm max-w-none dark:prose-invert",
          isAI ? "text-gray-800 dark:text-gray-200 font-light" : "text-gray-500 dark:text-gray-400 font-normal"
        )}>
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}