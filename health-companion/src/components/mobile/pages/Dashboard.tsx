"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { HealthOrb } from "@/components/ui/HealthOrb";
import { Activity, MessageCircle, FileText, AlertCircle, Moon, Droplets, UserCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HealthSummary {
  summary: {
    totalLogs: number;
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
      };
    };
    latestRiskLevel: string | null;
  };
  latestLog?: {
    id: string;
    createdAt: string;
    symptoms: { items: Array<{ name: string; severity: string }> };
    vitals: Record<string, number>;
    lifestyle: Record<string, any>;
  };
}

export function MobileDashboard() {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-32">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-6 bg-white/50 backdrop-blur-xl border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <UserCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vitality Profile</p>
            <h2 className="text-lg font-bold text-gray-900 leading-none">{session?.user?.name || "Member"}</h2>
          </div>
        </div>
        <Link href="/log">
          <Button size="sm" className="rounded-full bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest h-9 px-4">
            + New Log
          </Button>
        </Link>
      </div>

      <main className="px-6 py-8 space-y-8">
        {/* Status Center */}
        <div className="text-center space-y-6 py-4 bg-white border border-white shadow-xl rounded-[3rem] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-transparent pointer-events-none" />
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] relative z-10">Current Status</p>
          <div className="relative z-10">
            <HealthOrb status={healthData?.summary.latestRiskLevel as any || "LOW"} />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 uppercase tracking-tighter relative z-10">
            {healthData?.summary.latestRiskLevel || "Optimal"}
          </h3>
        </div>

        {/* Vital Grid */}
        <div className="grid grid-cols-2 gap-4">
          <MobileMetricCard 
            icon={<Activity className="w-5 h-5" />} 
            label="Heart" 
            value={healthData?.latestLog?.vitals?.heartRate || "--"} 
            unit="bpm"
            color="text-blue-500"
          />
          <MobileMetricCard 
            icon={<Moon className="w-5 h-5" />} 
            label="Sleep" 
            value={healthData?.summary.lifestyle.averages.avgSleepHours || "--"} 
            unit="hrs"
            color="text-purple-500"
          />
        </div>

        {/* Latest Log Snapshot */}
        <div className="p-8 bg-gray-50 border border-gray-100 rounded-[2.5rem] space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Latest Snapshot</h4>
            <span className="text-[10px] font-medium text-gray-400">
              {healthData?.latestLog ? new Date(healthData.latestLog.createdAt).toLocaleDateString() : "No data"}
            </span>
          </div>
          
          <div className="space-y-4">
            {healthData?.latestLog?.symptoms.items.length ? (
              <div className="flex flex-wrap gap-2">
                {healthData.latestLog.symptoms.items.map(s => (
                  <span key={s.name} className="px-3 py-1.5 bg-white border border-white shadow-sm rounded-xl text-xs font-medium text-gray-600">
                    {s.name}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 text-green-600">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">System status nominal</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions List */}
        <div className="space-y-3">
          <MobileActionLink href="/chat" label="The AI Oracle" icon={<MessageCircle />} />
          <MobileActionLink href="/reports" label="Clinical Reports" icon={<FileText />} />
          <MobileActionLink href="/sos" label="Guardian SOS" icon={<AlertCircle />} alert />
        </div>
      </main>
    </div>
  );
}

function MobileMetricCard({ icon, label, value, unit, color }: any) {
  return (
    <div className="bg-white border border-white shadow-lg p-6 rounded-[2rem] space-y-3 text-center">
      <div className={cn("w-10 h-10 rounded-2xl bg-gray-50 mx-auto flex items-center justify-center", color)}>
        {icon}
      </div>
      <div>
        <div className="text-xl font-bold text-gray-900">{value} <span className="text-[10px] font-normal text-gray-400">{unit}</span></div>
        <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{label}</div>
      </div>
    </div>
  );
}

function MobileActionLink({ href, label, icon, alert }: any) {
  return (
    <Link href={href}>
      <div className={cn(
        "flex items-center justify-between p-5 rounded-3xl border transition-all active:scale-95",
        alert ? "bg-red-50 border-red-100 text-red-600" : "bg-white border-white shadow-md text-gray-700"
      )}>
        <div className="flex items-center gap-4">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", alert ? "bg-white text-red-500" : "bg-primary/5 text-primary")}>
            {icon}
          </div>
          <span className="text-sm font-bold uppercase tracking-widest">{label}</span>
        </div>
        <ChevronRight className="w-4 h-4 opacity-30" />
      </div>
    </Link>
  );
}

function ChevronRight(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
