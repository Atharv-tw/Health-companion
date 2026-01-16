"use client";

import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { ShimmerBackground } from "@/components/ui/ShimmerBackground";
import { CeramicCard } from "@/components/ui/CeramicCard";
import { motion } from "framer-motion";
import { Database, Network, Search, ShieldCheck, ArrowRight, Layers, Workflow } from "lucide-react";

export default function MethodologyPage() {
  return (
    <div className="relative min-h-screen">
      <ShimmerBackground />
      <LandingNavbar />
      
      <main className="pt-40 px-6 pb-32">
        {/* Step-by-Step Narrative with 3D elements */}
        <section className="container mx-auto max-w-6xl space-y-40">
          
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase">Framework / RAG-8</span>
            <h1 className="text-6xl font-bold text-gray-900 tracking-tighter uppercase">The Method.</h1>
            <p className="text-xl text-gray-500 font-light leading-relaxed">
              Precision health requires more than just code. It requires a orchestrated synchronization of data acquisition and neural logic.
            </p>
          </div>

          {/* Phase 1 */}
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="text-primary font-bold text-xs tracking-widest uppercase">Phase 01</div>
              <h2 className="text-5xl font-bold text-gray-900 tracking-tight uppercase leading-[0.9]">Signal <br /> Acquisition.</h2>
              <p className="text-lg text-gray-500 font-light leading-relaxed">
                Raw biological data is collected from three distinct sources. This data is normalized and sanitized locally before entering the intelligence layer.
              </p>
              <div className="flex gap-4">
                <MiniTag label="Biometrics" />
                <MiniTag label="Symptom Log" />
                <MiniTag label="Lab Records" />
              </div>
            </motion.div>
            
            <div className="[perspective:1500px]">
              <CeramicCard className="aspect-video bg-white/40 border-white/60 shadow-2xl flex flex-col justify-center p-12 space-y-8">
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center gap-6"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-xl">
                    <Database className="w-6 h-6" />
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-blue-500/50 to-transparent" />
                  <div className="text-xs font-bold text-blue-500">RAW DATA</div>
                </motion.div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{ x: "-100%" }} whileInView={{ x: "100%" }} transition={{ duration: 2, repeat: Infinity }} className="w-full h-full bg-blue-400" />
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{ x: "-100%" }} whileInView={{ x: "100%" }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="w-full h-full bg-blue-400" />
                  </div>
                </div>
              </CeramicCard>
            </div>
          </div>

          {/* Phase 2: Neural Council */}
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 [perspective:1500px]">
              <CeramicCard className="aspect-square bg-gray-900 border-white/10 shadow-2xl relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_70%)]" />
                <div style={{ transform: "translateZ(100px)" }} className="grid grid-cols-2 gap-4 relative z-10 w-full max-w-xs">
                  {[...Array(4)].map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                      className="aspect-square bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-white"
                    >
                      <Workflow className="w-6 h-6 text-primary" />
                    </motion.div>
                  ))}
                </div>
              </CeramicCard>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8 order-1 lg:order-2"
            >
              <div className="text-primary font-bold text-xs tracking-widest uppercase">Phase 02</div>
              <h2 className="text-5xl font-bold text-gray-900 tracking-tight uppercase leading-[0.9]">Neural <br /> Council.</h2>
              <p className="text-lg text-gray-500 font-light leading-relaxed">
                An 8-agent council of specialized LLM nodes debates your data. Each agent is constrained to its clinical domain (e.g., Symptom Triage vs. Mental Wellness) to ensure focus and safety.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px]">1</div>
                  ORCHESTRATOR ROUTING
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px]">2</div>
                  SPECIALIST ANALYSIS
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px]">3</div>
                  CONSENSUS MERGING
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Phase 3: Verified RAG */}
          <div className="pb-20">
            <CeramicCard className="p-20 bg-white/40 border-white/60 text-center space-y-10">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <div className="space-y-4">
                <div className="text-primary font-bold text-xs tracking-widest uppercase">Phase 03</div>
                <h2 className="text-5xl font-bold text-gray-900 tracking-tight uppercase">The Knowledge Vault</h2>
                <p className="text-lg text-gray-500 font-light leading-relaxed max-w-2xl mx-auto">
                  Our RAG (Retrieval-Augmented Generation) pipeline acts as a hard filter. Agents can only generate responses based on snippets extracted from verified Tier-1 medical sources.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8 pt-10 border-t border-gray-100">
                <StatNode label="Source Verification" value="Tier-1 Only" />
                <StatNode label="RAG latency" value="<400ms" />
                <StatNode label="Hallucination rate" value="~0%" />
              </div>
            </CeramicCard>
          </div>

        </section>
      </main>
    </div>
  );
}

function MiniTag({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-gray-200 px-3 py-1 rounded-full">
      {label}
    </span>
  );
}

function StatNode({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</div>
    </div>
  );
}
