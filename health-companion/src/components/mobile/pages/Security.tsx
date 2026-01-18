"use client";

import { ShimmerBackground } from "@/components/ui/ShimmerBackground";
import { ShieldCheck, Lock, Fingerprint, ChevronLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function MobileSecurity() {
  return (
    <div className="relative min-h-screen bg-[#FAFAF9] dark:bg-slate-950 flex flex-col">
      <ShimmerBackground />

      <header className="px-6 py-6 flex items-center gap-4 z-20">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/50 dark:bg-slate-800/50 border border-white dark:border-slate-700">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <span className="font-bold text-[11px] uppercase tracking-[0.25em] text-gray-400 dark:text-gray-500">Security</span>
      </header>

      <main className="flex-1 px-6 pb-24 z-10">
        <div className="space-y-12 pt-4">
          <div>
            <h1 className="text-5xl font-bold tracking-tighter text-gray-900 dark:text-gray-50 leading-[0.9] uppercase">
              Zero <br />
              <span className="text-primary">Trust.</span>
            </h1>
          </div>

          <div className="space-y-4">
            <MobileSecurityItem 
              title="Identity Shield" 
              desc="PII removal via hashing." 
              icon={<Fingerprint className="w-5 h-5" />}
            />
            <MobileSecurityItem 
              title="AES-256 Storage" 
              desc="Military-grade encryption." 
              icon={<Lock className="w-5 h-5" />}
            />
            <MobileSecurityItem 
              title="Vercel Private" 
              desc="Secure bucket residency." 
              icon={<ShieldCheck className="w-5 h-5" />}
            />
          </div>

          <div className="p-8 bg-green-50 dark:bg-green-950/30 rounded-[2.5rem] border border-green-100 dark:border-green-900/50">
            <h3 className="font-bold text-green-900 dark:text-green-400 uppercase text-xs tracking-widest mb-6">Compliance</h3>
            <div className="space-y-4">
              <ComplianceRow label="HIPAA Protocol" />
              <ComplianceRow label="GDPR Alignment" />
              <ComplianceRow label="SOC2 Readiness" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function MobileSecurityItem({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-5 p-6 bg-white dark:bg-slate-900 border border-white dark:border-slate-800 shadow-xl rounded-3xl">
      <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-gray-900 dark:text-gray-50 uppercase text-[11px] tracking-widest">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-light">{desc}</p>
      </div>
    </div>
  );
}

function ComplianceRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-green-700 dark:text-green-400">
      <CheckCircle2 className="w-4 h-4" />
      <span className="text-xs font-bold uppercase tracking-tighter">{label}</span>
    </div>
  );
}
