"use client";

import { ShimmerBackground } from "@/components/ui/ShimmerBackground";
import { Brain, Shield, Zap, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function MobileAbout() {
  return (
    <div className="relative min-h-screen bg-[#FAFAF9] flex flex-col">
      <ShimmerBackground />
      
      {/* Mobile Header */}
      <header className="px-6 py-6 flex items-center gap-4 z-20">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/50 border border-white">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <span className="font-bold text-[11px] uppercase tracking-[0.25em] text-gray-400">Organization</span>
      </header>

      <main className="flex-1 px-6 pb-24 z-10">
        <div className="space-y-12">
          {/* Vertical Hero */}
          <div className="space-y-6 pt-4">
            <h1 className="text-5xl font-bold tracking-tighter text-gray-900 leading-[0.9] uppercase">
              The New <br />
              <span className="text-primary">Clarity.</span>
            </h1>
            <p className="text-gray-500 font-light text-lg">
              Empowering humanity with a bio-digital oracle that democratizes health literacy.
            </p>
          </div>

          {/* Simple Mission Block */}
          <div className="p-8 bg-gray-900 rounded-[2.5rem] text-white shadow-2xl space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">The Mission</span>
            <p className="text-xl font-light leading-snug">
              "We don't guess. We calculate against verified clinical protocols."
            </p>
          </div>

          {/* Stacked Value Cards */}
          <div className="space-y-4">
            <MobileValueRow icon={<Shield className="w-5 h-5" />} title="Privacy" desc="End-to-end encryption for every log." />
            <MobileValueRow icon={<Brain className="w-5 h-5" />} title="Context" desc="8-agent neural council at your service." />
            <MobileValueRow icon={<Zap className="w-5 h-5" />} title="Speed" desc="Atomic triage in under 2 seconds." />
          </div>
        </div>
      </main>
    </div>
  );
}

function MobileValueRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-5 p-6 bg-white/60 backdrop-blur-md border border-white/60 rounded-3xl">
      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-gray-900 uppercase text-[11px] tracking-widest">{title}</h3>
        <p className="text-sm text-gray-500 font-light">{desc}</p>
      </div>
    </div>
  );
}
