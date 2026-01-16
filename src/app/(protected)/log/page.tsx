"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Log Health</h1>
        <p className="text-gray-600 mt-1">
          Record your symptoms, vitals, and lifestyle information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Health Entry</CardTitle>
          <CardDescription>
            Fill in the information below to log your current health status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Health logging form will be implemented in Stage B.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
