"use client";

import { ChatInterface } from "@/components/chat/ChatInterface";

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Health Chat</h1>
        <p className="text-gray-600 mt-1">
          Get personalized health guidance from your AI companion.
        </p>
      </div>

      <div className="flex-1 bg-white rounded-lg border shadow-sm overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
}
