"use client";

import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isEmergency?: boolean;
  isBlocked?: boolean;
  timestamp?: Date;
}

export function ChatMessage({
  role,
  content,
  isEmergency,
  isBlocked,
  timestamp,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-5 py-4 shadow-sm",
          isUser
            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
            : isEmergency
            ? "bg-red-50 border-2 border-red-300 text-gray-900"
            : isBlocked
            ? "bg-yellow-50 border border-yellow-300 text-gray-900"
            : "bg-white border border-gray-200 text-gray-900"
        )}
      >
        {/* Emergency indicator */}
        {isEmergency && (
          <div className="flex items-center gap-2 mb-3 text-red-700 font-semibold text-base">
            <span className="text-xl">🚨</span>
            <span>Emergency Alert</span>
          </div>
        )}

        {/* Message content with proper markdown rendering */}
        <div
          className={cn(
            "text-[15px] leading-relaxed",
            isUser && "text-white"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <ReactMarkdown
              components={{
                // Headers with clear hierarchy
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold text-gray-900 mt-4 mb-2 first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-bold text-gray-900 mt-4 mb-2 first:mt-0">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-semibold text-gray-800 mt-3 mb-1.5 first:mt-0">
                    {children}
                  </h3>
                ),
                // Paragraphs
                p: ({ children }) => (
                  <p className="text-gray-700 mb-3 last:mb-0 leading-relaxed">
                    {children}
                  </p>
                ),
                // Bold text - used for section headers
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900 block mt-4 mb-2 text-[16px] first:mt-0">
                    {children}
                  </strong>
                ),
                // Unordered lists with proper bullets
                ul: ({ children }) => (
                  <ul className="my-2 ml-1 space-y-1.5">
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li className="flex items-start gap-2.5 text-gray-700">
                    <span className="text-blue-500 mt-1.5 text-xs">●</span>
                    <span className="flex-1">{children}</span>
                  </li>
                ),
                // Ordered lists
                ol: ({ children }) => (
                  <ol className="my-2 ml-1 space-y-1.5 list-none counter-reset-item">
                    {children}
                  </ol>
                ),
                // Horizontal rules
                hr: () => (
                  <hr className="my-4 border-gray-200" />
                ),
                // Code blocks
                code: ({ children }) => (
                  <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
                    {children}
                  </code>
                ),
                // Links
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-blue-600 hover:text-blue-800 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          )}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <div
            className={cn(
              "text-xs mt-3 pt-2 border-t",
              isUser
                ? "text-blue-200 border-blue-500/30"
                : "text-gray-400 border-gray-100"
            )}
          >
            {new Date(timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>
    </div>
  );
}
