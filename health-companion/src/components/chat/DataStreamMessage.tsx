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

/**
 * Pre-process content to ensure proper markdown formatting
 * This catches cases where the AI outputs list-like content without proper markdown
 */
function ensureMarkdownFormatting(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let inListSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if this is a header (bold text or ### style)
    const isBoldHeader = /^\*\*[^*]+\*\*$/.test(trimmed);
    const isHashHeader = /^#{1,3}\s/.test(trimmed);

    if (isBoldHeader || isHashHeader) {
      inListSection = true;
      result.push(line);
      continue;
    }

    // Empty line resets list detection
    if (trimmed === '') {
      result.push(line);
      continue;
    }

    // Already a bullet or numbered list - keep as is
    if (/^[-*]\s/.test(trimmed) || /^\d+[.)]\s/.test(trimmed)) {
      result.push(line);
      continue;
    }

    // Convert Unicode bullets to markdown
    if (/^[•●○◦▪▸►]\s*/.test(trimmed)) {
      result.push('- ' + trimmed.replace(/^[•●○◦▪▸►]\s*/, ''));
      continue;
    }

    // If we're in a list section and this looks like a list item
    // (starts with capital letter, is relatively short, follows a header)
    if (inListSection && trimmed.length > 0 && trimmed.length < 300) {
      // Check if it looks like a sentence/paragraph (contains multiple sentences or is very long)
      const isLongParagraph = trimmed.length > 150 && trimmed.includes('. ');

      if (!isLongParagraph && /^[A-Z]/.test(trimmed)) {
        result.push('- ' + trimmed);
        continue;
      }
    }

    // Regular text - might end the list section if it's a long paragraph
    if (trimmed.length > 150) {
      inListSection = false;
    }

    result.push(line);
  }

  return result.join('\n');
}

export function DataStreamMessage({ message, delay = 0 }: DataStreamMessageProps) {
  const isAI = message.role === "assistant";

  // Pre-process AI messages to ensure proper markdown
  const processedContent = isAI ? ensureMarkdownFormatting(message.content) : message.content;

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
          "pl-11 max-w-none",
          isAI ? "text-gray-800 dark:text-gray-200" : "text-gray-500 dark:text-gray-400"
        )}>
          <ReactMarkdown
            components={{
              // Bold headers
              strong: ({ children }) => (
                <strong className="block font-semibold text-gray-900 dark:text-gray-100 mt-4 mb-2 text-base first:mt-0">
                  {children}
                </strong>
              ),
              // Paragraphs
              p: ({ children }) => (
                <p className="text-gray-700 dark:text-gray-300 mb-3 last:mb-0 leading-relaxed text-[15px]">
                  {children}
                </p>
              ),
              // Unordered lists
              ul: ({ children }) => (
                <ul className="my-3 space-y-2">
                  {children}
                </ul>
              ),
              // List items with visible bullets
              li: ({ children }) => (
                <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300 text-[15px]">
                  <span className="text-primary mt-1.5 text-sm flex-shrink-0">●</span>
                  <span className="flex-1">{children}</span>
                </li>
              ),
              // H3 headers
              h3: ({ children }) => (
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mt-4 mb-2 text-base first:mt-0">
                  {children}
                </h3>
              ),
              // Links
              a: ({ href, children }) => (
                <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {processedContent}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}