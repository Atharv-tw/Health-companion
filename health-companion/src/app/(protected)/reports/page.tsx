"use client";

import { useState } from "react";
import { UploadDropzone } from "@/components/reports/UploadDropzone";
import { ReportsList } from "@/components/reports/ReportsList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    // Increment trigger to reload list
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Medical Reports</h1>
        <p className="text-gray-600 mt-2">
          Securely store and manage your medical documents, prescriptions, and test results.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Your Documents</h2>
          </div>
          
          <ReportsList refreshTrigger={refreshTrigger} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload New Report</CardTitle>
              <CardDescription>
                Supported formats: PDF, JPG, PNG (Max 10MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UploadDropzone onUploadComplete={handleUploadComplete} />
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-100">
            <CardHeader>
              <CardTitle className="text-base text-blue-900">Privacy Note</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800">
                Your reports are stored securely. Only you and your authorized emergency contacts (if granted) can access them.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}