"use client";

import { useState } from "react";
import { UploadDropzone } from "@/components/reports/UploadDropzone";
import { ReportsList } from "@/components/reports/ReportsList";
import { FileText, ChevronLeft, ShieldCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function MobileReports() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  const handleUploadComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
    setIsAdding(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAF9] pb-32">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-6 py-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <span className="font-bold text-[10px] uppercase tracking-[0.3em] text-gray-400">The Vault</span>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsAdding(!isAdding)}>
          <Plus className={cn("w-5 h-5 transition-transform", isAdding && "rotate-45")} />
        </Button>
      </div>

      <main className="flex-1 pt-24 px-6 space-y-8">
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-8 bg-white border border-white shadow-2xl rounded-[2.5rem] space-y-6 mb-8">
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest">Upload Protocol</h3>
                  <p className="text-[10px] text-gray-400 font-light uppercase tracking-tighter">Clinical Files (Max 10MB)</p>
                </div>
                <UploadDropzone onUploadComplete={handleUploadComplete} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tighter uppercase">Registry.</h2>
          </div>
          
          <ReportsList refreshTrigger={refreshTrigger} />
        </div>

        <div className="p-8 bg-blue-50/50 border border-blue-100 rounded-[2.5rem] space-y-4">
          <div className="flex items-center gap-2 text-blue-600">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Vault Security</span>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed font-light">
            Data is sharded and restricted to this authenticated identity only.
          </p>
        </div>
      </main>
    </div>
  );
}

// Importing cn here as well to be safe
import { cn } from "@/lib/utils";
