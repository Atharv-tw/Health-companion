"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Health Chat</h1>
        <p className="text-gray-600 mt-1">
          Get personalized health guidance from your AI companion.
        </p>
      </div>

      <Card className="h-[calc(100vh-16rem)]">
        <CardHeader>
          <CardTitle>Chat with Health Companion</CardTitle>
          <CardDescription>
            Ask questions about your health. Remember: this is not medical advice.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-full">
          <p className="text-sm text-gray-500">
            Chat interface will be implemented in Stage E.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
