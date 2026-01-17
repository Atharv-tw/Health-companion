"use client";

import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { ShimmerBackground } from "@/components/ui/ShimmerBackground";
import { CeramicCard } from "@/components/ui/CeramicCard";
import { motion } from "framer-motion";
import { Database, Workflow } from "lucide-react";

export function DesktopMethodology() {
  return (
    <div className="relative min-h-screen">
      <ShimmerBackground />
      <LandingNavbar />
      
      <main className="pt-40 px-6 pb-32">
        <section className="container mx-auto max-w-6xl space-y-40">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase">Framework / RAG-8</span>
            <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 tracking-tighter uppercase">The Method.</h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 font-light leading-relaxed">
              Precision health requires more than just code. It requires a orchestrated synchronization of data acquisition and neural logic.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div className="space-y-8">
              <div className="text-primary font-bold text-xs tracking-widest uppercase">Phase 01</div>
              <h2 className="text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight uppercase leading-[0.9]">Signal <br /> Acquisition.</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 font-light leading-relaxed">
                Raw biological data is collected from three distinct sources. This data is normalized and sanitized locally before entering the intelligence layer.
              </p>
            </motion.div>
            
            <div className="[perspective:1500px]">
              <CeramicCard className="aspect-video bg-white/40 dark:bg-gray-800/40 border-white/60 dark:border-gray-700/60 shadow-2xl flex flex-col justify-center p-12 space-y-8">
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-xl">
                    <Database className="w-6 h-6" />
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-blue-500/50 to-transparent" />
                  <div className="text-xs font-bold text-blue-500 uppercase">Raw Data</div>
                </motion.div>
              </CeramicCard>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 [perspective:1500px]">
              <CeramicCard className="aspect-square bg-gray-900 dark:bg-gray-800 border-white/10 dark:border-gray-700/30 shadow-2xl relative overflow-hidden flex items-center justify-center">
                <div style={{ transform: "translateZ(100px)" }} className="grid grid-cols-2 gap-4 relative z-10 w-full max-w-xs">
                  {[...Array(4)].map((_, i) => (
                    <motion.div key={i} animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }} className="aspect-square bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-white">
                      <Workflow className="w-6 h-6 text-primary" />
                    </motion.div>
                  ))}
                </div>
              </CeramicCard>
            </div>

            <motion.div className="space-y-8 order-1 lg:order-2">
              <div className="text-primary font-bold text-xs tracking-widest uppercase">Phase 02</div>
              <h2 className="text-5xl font-bold text-gray-900 dark:text-gray-100 tracking-tight uppercase leading-[0.9]">Neural <br /> Council.</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 font-light leading-relaxed">
                An 8-agent council of specialized LLM nodes debates your data. Each agent is constrained to its clinical domain to ensure focus and safety.
              </p>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
