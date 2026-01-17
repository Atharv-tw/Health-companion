"use client";

import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { ShimmerBackground } from "@/components/ui/ShimmerBackground";
import { ShieldCheck, Lock, Fingerprint, Cpu } from "lucide-react";

export function DesktopSecurity() {
  return (
    <div className="relative min-h-screen">
      <ShimmerBackground />
      <LandingNavbar />
      
      <main className="pt-40 px-6 pb-32">
        <section className="container mx-auto max-w-6xl mb-40 text-center space-y-12">
          <div className="flex flex-col items-center space-y-8">
            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-2xl text-primary border border-white/60 dark:border-gray-700/60">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold text-gray-900 dark:text-gray-100 tracking-tighter uppercase leading-none">
              Ironclad <br /> <span className="text-gray-300 dark:text-gray-600">Privacy.</span>
            </h1>
          </div>
        </section>

        <section className="container mx-auto max-w-6xl grid md:grid-cols-3 bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-2xl overflow-hidden mb-40">
          <LifecycleStep icon={<Fingerprint />} title="Identity Shield" desc="Personally Identifiable Information is decoupled using cryptographic hashing." />
          <LifecycleStep icon={<Cpu />} title="Enclave Processing" desc="Computation occurs in isolated environments where admins cannot view raw data." />
          <LifecycleStep icon={<Lock />} title="AES-256 Storage" desc="Logs are sharded and stored using military-grade encryption standards." />
        </section>
      </main>
    </div>
  );
}

function LifecycleStep({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-12 border-r last:border-r-0 border-gray-100/50 dark:border-gray-700/50 hover:bg-white/40 dark:hover:bg-gray-700/40 transition-colors">
      <div className="w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center mb-8">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight mb-4">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed">{desc}</p>
    </div>
  );
}
