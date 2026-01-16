"use client";

import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { ShimmerBackground } from "@/components/ui/ShimmerBackground";
import { CeramicCard } from "@/components/ui/CeramicCard";
import { motion } from "framer-motion";
import { Brain, Shield, Zap, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="relative min-h-screen">
      <ShimmerBackground />
      <LandingNavbar />
      
      <main className="pt-40 px-6 pb-32">
        {/* Intensely Styled Hero */}
        <section className="container mx-auto max-w-6xl mb-32">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/50 backdrop-blur-md border border-white/50 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-primary shadow-sm mb-8">
                <Sparkles className="w-3 h-3" />
                <span>Establishment 2026</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-bold text-gray-900 tracking-tight leading-[0.85] mb-10">
                THE NEW <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-teal-400">VITALITY.</span>
              </h1>
              <p className="text-xl text-gray-500 font-light leading-relaxed max-w-lg">
                We are building the world's most advanced bio-digital bridge. 
                A platform where every heartbeat is a data point, and every symptom is an insight.
              </p>
            </motion.div>

            <div className="relative [perspective:2000px]">
              <CeramicCard className="aspect-square bg-white/40 flex items-center justify-center border-white/60 shadow-2xl relative overflow-hidden group">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,oklch(0.65_0.18_250/0.1),transparent)] opacity-50"
                />
                <div style={{ transform: "translateZ(100px)" }} className="relative text-center">
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl mx-auto mb-6">
                    <Brain className="w-12 h-12 text-primary" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Neural Core</span>
                </div>
              </CeramicCard>
            </div>
          </div>
        </section>

        {/* 3D Value Grid */}
        <section className="container mx-auto max-w-6xl grid md:grid-cols-3 gap-8 [perspective:1500px]">
          <AboutValueCard 
            icon={<Shield />}
            title="Sovereign Privacy"
            desc="Your data is encrypted at the source. We provide clinical clarity without compromising personal identity."
            delay={0.2}
          />
          <AboutValueCard 
            icon={<Brain />}
            title="Infinite Context"
            desc="Our 8-agent council maintains your health history across every interaction for radical precision."
            delay={0.4}
          />
          <AboutValueCard 
            icon={<Zap />}
            title="Atomic Triage"
            desc="Deterministic logic identifies critical signals in milliseconds, bypassing conversation for safety."
            delay={0.6}
          />
        </section>

        {/* Philosophy Section */}
        <section className="container mx-auto max-w-4xl mt-40 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-16 bg-white/30 backdrop-blur-2xl border border-white/60 rounded-[3rem] shadow-2xl"
          >
            <h2 className="text-4xl font-medium text-gray-900 mb-8 tracking-tight">"Health isn't static. Neither should be your tracking."</h2>
            <p className="text-gray-500 font-light text-lg leading-relaxed mb-12">
              The Health Companion project started with a single goal: to replace medical uncertainty with technical certainty. We don't advise; we calculate against verified global protocols.
            </p>
            <Button className="rounded-full px-10 h-14 bg-gray-900 text-white hover:bg-black uppercase tracking-widest text-xs font-bold">
              Join the Vanguard
            </Button>
          </motion.div>
        </section>
      </main>
    </div>
  );
}

function AboutValueCard({ icon, title, desc, delay }: any) {
  return (
    <CeramicCard delay={delay} className="p-10 flex flex-col items-center text-center space-y-6">
      <div style={{ transform: "translateZ(50px)" }} className="space-y-6 flex flex-col items-center">
        <div className="w-14 h-14 bg-primary/5 text-primary rounded-2xl flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-xl font-bold tracking-tight text-gray-900 uppercase">{title}</h3>
        <p className="text-sm text-gray-500 font-light leading-relaxed">{desc}</p>
      </div>
    </CeramicCard>
  );
}