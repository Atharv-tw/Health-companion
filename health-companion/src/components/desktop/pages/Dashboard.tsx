"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CeramicCard } from "@/components/ui/CeramicCard";
import { HealthOrb } from "@/components/ui/HealthOrb";
import { Activity, MessageCircle, FileText, AlertCircle, Moon, Droplets } from "lucide-react";
import { motion } from "framer-motion";

interface HealthSummary {
  summary: {
    totalLogs: number;
    dateRange: { start: string; end: string };
    symptoms: {
      mostCommon: Array<{ name: string; count: number }>;
      totalReported: number;
    };
    vitals: {
      averages: {
        heartRate: number | null;
        temperature: number | null;
        bpSystolic: number | null;
        bpDiastolic: number | null;
        spO2: number | null;
      };
    };
    lifestyle: {
      averages: {
        avgSleepHours: number | null;
        stressDistribution: Record<string, number>;
        hydrationDistribution: Record<string, number>;
      };
    };
    latestRiskLevel: string | null;
    dailyTrends: Array<{ date: string; logs: number; symptoms: number }>;
  };
  latestLog?: {
    id: string;
    createdAt: string;
    symptoms: { items: Array<{ name: string; severity: string }>; freeText?: string };
    vitals: Record<string, number>;
    lifestyle: Record<string, unknown>;
    riskAlert?: {
      id: string;
      riskLevel: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
      reasons: string[];
      nextSteps: string[];
      redFlags: string[];
      consultAdvice: string;
    };
  };
}

export function DesktopDashboard() {
  const { data: session } = useSession();
  const [healthData, setHealthData] = useState<HealthSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHealthSummary = async () => {
      try {
        const res = await fetch("/api/health/summary?range=7d");
        if (res.ok) {
          const data = await res.json();
          setHealthData(data);
        }
      } catch (error) {
        console.error("Failed to fetch health summary:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHealthSummary();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-6xl mx-auto pt-8"
    >
      {/* Header Section */}
      <motion.div variants={item} className="text-center space-y-2 py-6">
        <h1 className="text-4xl font-light tracking-tight text-gray-900">
          Hello, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500 font-medium">
            {session?.user?.name || "Friend"}
          </span>
        </h1>
        <p className="text-gray-500 font-light text-lg">Your vital signs are looking stable today.</p>
      </motion.div>

      {/* Hero Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Health Status Orb (Centerpiece) */}
        <CeramicCard tiltEffect={false} className="md:col-span-1 flex flex-col items-center justify-center py-10 bg-white/60 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-6 font-medium">Current Status</h2>
          <HealthOrb status={healthData?.summary.latestRiskLevel as any || "LOW"} />
          <p className="mt-6 text-2xl font-light text-gray-700">
            {healthData?.summary.latestRiskLevel || "Optimal"}
          </p>
        </CeramicCard>

        {/* 2. Latest Log Summary */}
        <CeramicCard tiltEffect={false} delay={0.1} className="md:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-medium text-gray-800">Latest Insights</h3>
              <p className="text-sm text-gray-400 mt-1">
                {healthData?.latestLog 
                  ? new Date(healthData.latestLog.createdAt).toLocaleDateString(undefined, { weekday: 'long', hour: 'numeric', minute: 'numeric' }) 
                  : "No recent activity"}
              </p>
            </div>
            <Link href="/log">
               <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium shadow-lg shadow-primary/20">
                 + New Log
               </motion.button>
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            {healthData?.latestLog?.symptoms.items.length ? (
               <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                 <p className="text-xs text-gray-400 uppercase mb-2">Symptoms</p>
                 <div className="flex flex-wrap gap-1">
                   {healthData.latestLog.symptoms.items.slice(0, 3).map(s => (
                     <span key={s.name} className="px-2 py-1 bg-white text-gray-600 rounded-md text-xs shadow-sm border border-gray-100">{s.name}</span>
                   ))}
                   {healthData.latestLog.symptoms.items.length > 3 && (
                     <span className="px-2 py-1 text-xs text-gray-400">+More</span>
                   )}
                 </div>
               </div>
            ) : (
              <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100/50 flex items-center justify-center text-green-700 text-sm">
                 All Clear
              </div>
            )}

            <div className="space-y-2">
               {/* Mini Vitals */}
               <div className="flex justify-between items-center p-2 px-3 bg-blue-50/30 rounded-xl">
                 <div className="flex items-center gap-2 text-blue-600">
                   <Activity className="w-4 h-4" />
                   <span className="text-xs font-medium">Heart</span>
                 </div>
                 <span className="text-sm font-bold text-gray-700">{healthData?.latestLog?.vitals?.heartRate || "--"} <span className="text-xs font-normal text-gray-400">bpm</span></span>
               </div>
               
               {/* Mini Lifestyle */}
               <div className="flex justify-between items-center p-2 px-3 bg-purple-50/30 rounded-xl">
                  <div className="flex items-center gap-2 text-purple-600">
                    <Moon className="w-4 h-4" />
                    <span className="text-xs font-medium">Sleep</span>
                  </div>
                  <span className="text-sm font-bold text-gray-700">{healthData?.latestLog?.lifestyle?.sleepHours as number || "--"} <span className="text-xs font-normal text-gray-400">hr</span></span>
               </div>
            </div>
          </div>
        </CeramicCard>

      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <StatsCard 
            label="Total Logs" 
            value={healthData?.summary.totalLogs || 0} 
            icon={FileText} 
            color="text-blue-500" 
            delay={0.2}
         />
         <StatsCard 
            label="Avg Heart Rate" 
            value={healthData?.summary.vitals.averages.heartRate || "--"} 
            unit="bpm"
            icon={Activity} 
            color="text-rose-500" 
            delay={0.3}
         />
         <StatsCard 
            label="Avg Sleep" 
            value={healthData?.summary.lifestyle.averages.avgSleepHours || "--"} 
            unit="hrs"
            icon={Moon} 
            color="text-indigo-500" 
            delay={0.4}
         />
         <StatsCard 
            label="Hydration" 
            value="Good" 
            icon={Droplets} 
            color="text-cyan-500" 
            delay={0.5}
         />
      </div>

      {/* Quick Actions (Floating Pill Style) */}
      <motion.div 
        variants={item}
        className="flex justify-center gap-4 py-8"
      >
         <QuickAction href="/chat" icon={MessageCircle} label="AI Chat" />
         <QuickAction href="/reports" icon={FileText} label="Reports" />
         <QuickAction href="/sos" icon={AlertCircle} label="SOS" alert />
      </motion.div>

    </motion.div>
  );
}

function StatsCard({ label, value, unit, icon: Icon, color, delay }: any) {
  return (
    <CeramicCard tiltEffect={false} delay={delay} className="flex flex-col items-center justify-center py-6 gap-2 text-center hover:scale-[1.02] transition-transform">
       <div className={`p-3 rounded-full bg-white shadow-sm ${color} mb-1`}>
         <Icon className="w-5 h-5" />
       </div>
       <div className="text-2xl font-light text-gray-900">
         {value} <span className="text-xs text-gray-400 font-normal">{unit}</span>
       </div>
       <div className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</div>
    </CeramicCard>
  )
}

function QuickAction({ href, icon: Icon, label, alert }: any) {
  return (
    <Link href={href}>
      <motion.div 
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.95 }}
        className={`flex flex-col items-center gap-2 group cursor-pointer`}
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${alert ? 'bg-red-50 text-red-500 group-hover:bg-red-100' : 'bg-white text-gray-500 group-hover:bg-gray-50'}`}>
           <Icon className="w-6 h-6" />
        </div>
        <span className="text-xs font-medium text-gray-500 group-hover:text-gray-900 transition-colors">{label}</span>
      </motion.div>
    </Link>
  )
}
