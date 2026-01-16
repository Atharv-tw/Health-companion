"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "./ChatMessage";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Array<{ source: string; title?: string }>;
  isEmergency?: boolean;
  isBlocked?: boolean;
  createdAt: Date;
}

interface ChatInterfaceProps {
  initialMessages?: Message[];
  sessionId?: string;
}

export function ChatInterface({ initialMessages = [], sessionId: initialSessionId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const [showSOSPrompt, setShowSOSPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);
    setShowSOSPrompt(false);

    // Add user message immediately
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessage,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      // Update session ID
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      // Add assistant message
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response,
        citations: data.citations,
        isEmergency: data.safetyResult === "EMERGENCY_ESCALATE",
        isBlocked: data.safetyResult === "BLOCK_UNSAFE",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Show SOS prompt for emergencies
      if (data.shouldTriggerSOS) {
        setShowSOSPrompt(true);
      }
    } catch {
      // Add error message
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I encountered an error processing your message. Please try again.",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const suggestedQuestions = [
    "What can help with headaches?",
    "How can I improve my sleep?",
    "What are signs of dehydration?",
    "Tips for managing stress",
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Health Companion Chat
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Ask me about general health information, wellness tips, or help understanding your symptoms.
              I can&apos;t diagnose conditions or prescribe medications.
            </p>

            {/* Suggested questions */}
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => setInput(question)}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                citations={message.citations}
                isEmergency={message.isEmergency}
                isBlocked={message.isBlocked}
                timestamp={message.createdAt}
              />
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 rounded-lg px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* SOS Prompt */}
      {showSOSPrompt && (
        <div className="mx-4 mb-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium mb-2">
            This sounds like an emergency situation.
          </p>
          <div className="flex gap-2">
            <Link href="/sos">
              <Button variant="destructive" size="sm">
                Go to SOS / Emergency Contacts
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSOSPrompt(false)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a health question..."
            disabled={isLoading}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 min-h-[44px] max-h-[150px]"
            rows={1}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6"
          >
            {isLoading ? "..." : "Send"}
          </Button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          This is not medical advice. Always consult a healthcare professional for medical concerns.
        </p>
      </div>
    </div>
  );
}
