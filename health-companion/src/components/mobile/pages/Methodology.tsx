"use client";

import { ShimmerBackground } from "@/components/ui/ShimmerBackground";
import { Database, ShieldCheck, Workflow, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function MobileMethodology() {
  return (
    <div className="relative min-h-screen bg-[#FAFAF9] flex flex-col">
      <ShimmerBackground />
      
      <header className="px-6 py-6 flex items-center gap-4 z-20">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/50 border border-white">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <span className="font-bold text-[11px] uppercase tracking-[0.25em] text-gray-400">The Method</span>
      </header>

      <main className="flex-1 px-6 pb-24 z-10">
        <div className="space-y-16 pt-4">
          <div>
            <h1 className="text-5xl font-bold tracking-tighter text-gray-900 leading-[0.9] uppercase">
              Clinical <br />
              <span className="text-primary">Logic.</span>
            </h1>
          </div>

          <div className="space-y-12">
            <MobileStep 
              num="01" 
              title="Signal Acquisition" 
              desc="Normalization of biometric, symptomatic, and clinical data streams."
              icon={<Database className="w-5 h-5" />}
            />
            <MobileStep 
              num="02" 
              title="Neural Council" 
              desc="Multi-agent orchestration ensures domain-specific analysis."
              icon={<Workflow className="w-5 h-5" />}
            />
            <MobileStep 
              num="03" 
              title="Verified RAG" 
              desc="Real-time validation against CDC and WHO medical knowledge."
              icon={<ShieldCheck className="w-5 h-5" />}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function MobileStep({ num, title, desc, icon }: { num: string; title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div className="relative pl-12 space-y-2">
      <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
        {num}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-gray-400">{icon}</div>
        <h3 className="font-bold text-gray-900 uppercase text-sm tracking-widest">{title}</h3>
      </div>
      <p className="text-gray-500 font-light leading-relaxed">{desc}</p>
    </div>
  );
}
