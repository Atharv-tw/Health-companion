"use client";

import { useState } from "react";
import { UploadDropzone } from "@/components/reports/UploadDropzone";
import { ReportsList } from "@/components/reports/ReportsList";
import { CeramicCard } from "@/components/ui/CeramicCard";
import { ShieldCheck, FileText } from "lucide-react";

export function DesktopReports() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto pt-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 uppercase">Clinical Vault</h1>
        <p className="text-gray-500 dark:text-gray-400 font-light text-lg">Secure storage and neural analysis of your medical documentation.</p>
      </div>

      <div className="grid gap-12 lg:grid-cols-[2.5fr_1.5fr]">
        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tighter">Document Registry</h2>
          </div>
          
          <ReportsList refreshTrigger={refreshTrigger} />
        </div>

        <div className="space-y-8">
          <CeramicCard tiltEffect={false} className="p-8 space-y-6 bg-white/60 dark:bg-gray-800/60">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tighter">Acquisition</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-light">Supported: PDF, JPG, PNG (Max 10MB)</p>
            </div>
            <UploadDropzone onUploadComplete={handleUploadComplete} />
          </CeramicCard>

          <CeramicCard tiltEffect={false} className="p-8 bg-blue-50/30 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 space-y-4">
            <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Privacy Protocol</h3>
            </div>
            <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed font-light">
              All documents are sharded and encrypted at rest. Access is restricted to your authenticated session and verified emergency contacts.
            </p>
          </CeramicCard>
        </div>
      </div>
    </div>
  );
}
