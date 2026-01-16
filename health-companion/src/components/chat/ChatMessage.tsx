"use client";

import { cn } from "@/lib/utils";

interface Citation {
  source: string;
  title?: string;
  snippet?: string;
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  isEmergency?: boolean;
  isBlocked?: boolean;
  timestamp?: Date;
}

export function ChatMessage({
  role,
  content,
  citations,
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
          "max-w-[80%] rounded-lg px-4 py-3",
          isUser
            ? "bg-blue-600 text-white"
            : isEmergency
            ? "bg-red-50 border-2 border-red-300 text-gray-900"
            : isBlocked
            ? "bg-yellow-50 border border-yellow-300 text-gray-900"
            : "bg-gray-100 text-gray-900"
        )}
      >
        {/* Emergency indicator */}
        {isEmergency && (
          <div className="flex items-center gap-2 mb-2 text-red-700 font-semibold">
            <span className="text-lg">🚨</span>
            <span>Emergency Alert</span>
          </div>
        )}

        {/* Message content */}
        <div
          className={cn(
            "prose prose-sm max-w-none",
            isUser && "prose-invert"
          )}
        >
          {/* Render markdown-like content */}
          {content.split("\n").map((line, i) => {
            // Handle bold text
            const boldRegex = /\*\*(.*?)\*\*/g;
            const formattedLine = line.replace(boldRegex, "<strong>$1</strong>");

            // Handle bullet points
            if (line.startsWith("- ") || line.startsWith("• ")) {
              return (
                <div key={i} className="flex items-start gap-2 ml-2">
                  <span>•</span>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: formattedLine.substring(2),
                    }}
                  />
                </div>
              );
            }

            // Handle numbered lists
            const numberedMatch = line.match(/^(\d+)\.\s(.*)$/);
            if (numberedMatch) {
              return (
                <div key={i} className="flex items-start gap-2 ml-2">
                  <span className="font-medium">{numberedMatch[1]}.</span>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: numberedMatch[2].replace(boldRegex, "<strong>$1</strong>"),
                    }}
                  />
                </div>
              );
            }

            // Handle headers (marked with **)
            if (line.startsWith("**") && line.endsWith("**")) {
              return (
                <p key={i} className="font-semibold mt-2 mb-1">
                  {line.slice(2, -2)}
                </p>
              );
            }

            // Handle dividers
            if (line === "---") {
              return <hr key={i} className="my-2 border-gray-300" />;
            }

            // Empty lines
            if (line.trim() === "") {
              return <div key={i} className="h-2" />;
            }

            // Regular paragraph
            return (
              <p
                key={i}
                className="mb-1"
                dangerouslySetInnerHTML={{ __html: formattedLine }}
              />
            );
          })}
        </div>

        {/* Citations */}
        {citations && citations.length > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Sources:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              {citations.map((citation, index) => (
                <li key={index}>
                  {citation.title || citation.source}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Timestamp */}
        {timestamp && (
          <div
            className={cn(
              "text-xs mt-2",
              isUser ? "text-blue-200" : "text-gray-400"
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
