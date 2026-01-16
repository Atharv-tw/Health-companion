"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShimmerBackground } from "@/components/ui/ShimmerBackground";
import {
  Heart,
  ArrowRight,
  Activity,
  MessageSquare,
  ShieldAlert,
  UserCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileHome() {
  return (
    <div className="relative min-h-screen bg-[#FAFAF9] flex flex-col">
      <ShimmerBackground />
      
      {/* Mobile Top Bar */}
      <header className="px-6 py-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[13px] uppercase tracking-widest text-gray-900">Health Companion</span>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full bg-white/50 shadow-sm border border-white">
          <UserCircle2 className="w-5 h-5 text-gray-600" />
        </Button>
      </header>

      {/* Main Content - Vertically Centered Hero */}
      <main className="flex-1 px-6 flex flex-col justify-center pb-24 z-10">
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-5xl font-bold tracking-tighter text-gray-900 leading-[0.9] uppercase">
              The New <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">Vitality.</span>
            </h1>
            <p className="text-gray-500 font-light text-lg max-w-[280px]">
              Clinical-grade AI guidance, optimized for your handheld journey.
            </p>
          </motion.div>

          {/* Large CTA for Mobile (Thumb Friendly) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <Link href="/signup">
              <Button className="w-full h-16 rounded-3xl bg-gray-900 text-white text-sm font-bold uppercase tracking-widest shadow-2xl">
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full h-16 rounded-3xl bg-white/50 backdrop-blur-sm border-white text-sm font-bold uppercase tracking-widest">
                Sign In
              </Button>
            </Link>
          </motion.div>

          {/* Horizontal Swipe Section (Placeholder visual) */}
          <div className="pt-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-6">Core Protocols</p>
            <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
              <MobileFeatureCard icon={<Activity />} title="Logs" color="text-blue-500" />
              <MobileFeatureCard icon={<MessageSquare />} title="AI Oracle" color="text-purple-500" />
              <MobileFeatureCard icon={<ShieldAlert />} title="Guardian" color="text-red-500" />
            </div>
          </div>
        </div>
      </main>

      {/* Safety Note for Mobile */}
      <footer className="px-6 pb-10 text-center opacity-40">
        <p className="text-[9px] font-medium uppercase tracking-widest">Architected for Precision • 2026</p>
      </footer>
    </div>
  );
}

function MobileFeatureCard({ icon, title, color }: { icon: React.ReactNode; title: string; color: string }) {
  return (
    <div className="min-w-[140px] p-6 bg-white border border-white/60 rounded-[2.5rem] shadow-xl space-y-4">
      <div className={cn("w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center", color)}>
        {icon}
      </div>
      <h3 className="font-bold text-gray-900 uppercase text-xs tracking-tighter">{title}</h3>
    </div>
  );
}
