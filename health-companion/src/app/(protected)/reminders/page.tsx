"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RemindersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
        <p className="text-gray-600 mt-1">
          Set up reminders for medications, hydration, and more.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Reminders</CardTitle>
          <CardDescription>
            Create and manage your health reminders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Reminder functionality will be implemented in Stage G.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
