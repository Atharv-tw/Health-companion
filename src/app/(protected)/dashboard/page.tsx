"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome{session?.user?.name ? `, ${session.user.name}` : ""}!
        </h1>
        <p className="text-gray-600 mt-1">
          Track your health and get personalized guidance.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Latest Health Log</CardTitle>
            <CardDescription>Your most recent health entry</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">No health logs yet. Start by logging your health.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Risk Status</CardTitle>
            <CardDescription>Current health risk assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-green-700">No active alerts</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reminders</CardTitle>
            <CardDescription>Upcoming health reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">No reminders set up yet.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="/log"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">📝</div>
              <div className="font-medium">Log Health</div>
              <div className="text-xs text-gray-500">Record symptoms & vitals</div>
            </a>
            <a
              href="/chat"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">💬</div>
              <div className="font-medium">Chat</div>
              <div className="text-xs text-gray-500">Get health guidance</div>
            </a>
            <a
              href="/reports"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">📄</div>
              <div className="font-medium">Reports</div>
              <div className="text-xs text-gray-500">Upload medical reports</div>
            </a>
            <a
              href="/sos"
              className="p-4 border rounded-lg hover:bg-red-50 transition-colors text-center border-red-200"
            >
              <div className="text-2xl mb-2">🚨</div>
              <div className="font-medium text-red-600">SOS</div>
              <div className="text-xs text-gray-500">Emergency contacts</div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
