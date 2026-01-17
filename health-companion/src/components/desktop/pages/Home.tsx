"use client";

import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { ShimmerBackground } from "@/components/ui/ShimmerBackground";
import { CeramicCard } from "@/components/ui/CeramicCard";
import { motion } from "framer-motion";
import { 
  Activity, 
  MessageSquare, 
  ShieldAlert, 
  ArrowRight,
  Sparkles,
  Heart
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function DesktopHome() {
  return (
    <div className="relative min-h-screen">
      <ShimmerBackground />
      <LandingNavbar />
      
      <main className="container mx-auto px-6 pt-48 pb-32 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-white/50 dark:border-gray-700/50 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-primary shadow-sm"
          >
            <Sparkles className="w-3 h-3" />
            <span>Next-Gen Health Intelligence</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-7xl md:text-9xl font-bold text-gray-900 dark:text-gray-100 tracking-tighter leading-[0.85] uppercase">
              THE FUTURE <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-teal-400">
                OF WELLNESS.
              </span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-500 dark:text-gray-400 font-light max-w-2xl mx-auto leading-relaxed"
          >
            Experience a bio-digital oracle that listens, tracks, and guides you toward optimal vitality. No noise, just clarity.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-6 justify-center pt-4"
          >
            <Link href="/signup">
              <Button size="lg" className="rounded-full px-10 h-16 text-xs font-bold uppercase tracking-widest bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-black dark:hover:bg-white shadow-2xl transition-all active:scale-95">
                Begin Journey <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="rounded-full px-10 h-16 text-xs font-bold uppercase tracking-widest bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-white dark:border-gray-700 shadow-lg hover:bg-white dark:hover:bg-gray-800 dark:text-gray-100 transition-all active:scale-95">
                Learn More
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="max-w-6xl mx-auto mt-48 [perspective:2000px]">
          <div className="grid md:grid-cols-3 gap-8">
            <CeramicCard delay={0.4} className="p-12 space-y-8 bg-white/40 dark:bg-gray-800/40 border-white/60 dark:border-gray-700/60">
              <div style={{ transform: "translateZ(80px)" }} className="space-y-6">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                  <Activity className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tighter leading-none">Vitality <br /> Logs.</h3>
                <p className="text-gray-500 dark:text-gray-400 font-light text-sm leading-relaxed">
                  Effortlessly track symptoms and vitals. Our engine detects patterns before they become problems.
                </p>
              </div>
            </CeramicCard>

            <CeramicCard delay={0.5} className="p-12 space-y-8 bg-white/40 dark:bg-gray-800/40 border-white/60 dark:border-gray-700/60">
              <div style={{ transform: "translateZ(80px)" }} className="space-y-6">
                <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-500/20">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tighter leading-none">The <br /> Oracle.</h3>
                <p className="text-gray-500 dark:text-gray-400 font-light text-sm leading-relaxed">
                  Chat with a multi-agent AI system trained on verified medical data. Secure, safe, and insightful.
                </p>
              </div>
            </CeramicCard>

            <CeramicCard delay={0.6} className="p-12 space-y-8 bg-white/40 dark:bg-gray-800/40 border-white/60 dark:border-gray-700/60 border-red-100/50 dark:border-red-900/30">
              <div style={{ transform: "translateZ(80px)" }} className="space-y-6">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-500 shadow-xl shadow-red-500/20">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tighter leading-none">Guardian <br /> Protocol.</h3>
                <p className="text-gray-500 dark:text-gray-400 font-light text-sm leading-relaxed">
                  Instant emergency escalation and SOS triggers. Peace of mind for you and your loved ones.
                </p>
              </div>
            </CeramicCard>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mt-48 p-12 bg-white/30 dark:bg-gray-800/30 backdrop-blur-3xl border border-white/60 dark:border-gray-700/60 rounded-[3rem] text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-[0.3em] mb-6">Safety Protocol</p>
          <p className="text-2xl text-gray-600 dark:text-gray-300 font-light italic leading-snug">
            "Health Companion is a health information system, not a clinical diagnosis tool. Always consult a human professional for medical decisions."
          </p>
        </motion.div>
      </main>

      <footer className="container mx-auto px-12 py-20 relative z-10 border-t border-gray-100/50 dark:border-gray-800/50">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 opacity-50 grayscale hover:opacity-100 transition-opacity duration-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white dark:text-gray-900" />
            </div>
            <span className="text-[12px] font-bold uppercase tracking-widest text-gray-900 dark:text-gray-100">Health Companion</span>
          </div>
          <div className="flex gap-10 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            <Link href="/privacy" className="hover:text-black dark:hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-black dark:hover:text-white">Terms</Link>
            <Link href="/contact" className="hover:text-black dark:hover:text-white">Support</Link>
          </div>
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            © 2026 ARCHITECTED FOR VITALITY
          </p>
        </div>
      </footer>
    </div>
  );
}
