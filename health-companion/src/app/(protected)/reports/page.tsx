"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Medical Reports</h1>
        <p className="text-gray-600 mt-1">
          Upload and manage your medical reports securely.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Reports</CardTitle>
          <CardDescription>
            Upload PDF or image files of your medical reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Report upload functionality will be implemented in Stage F.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
