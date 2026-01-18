"use client";

import { useEffect, useState } from "react";
import SOSButton from "@/components/sos/SOSButton";
import EmergencyContacts from "@/components/sos/EmergencyContacts";
import { ShieldAlert, AlertTriangle } from "lucide-react";
import { CeramicCard } from "@/components/ui/CeramicCard";
import { EmergencyContext } from "@/types/emergency";

interface DesktopSOSProps {
  autoActivate?: boolean;
  emergencyContext?: EmergencyContext | null;
}

// Map emergency types to display labels
const EMERGENCY_TYPE_LABELS: Record<string, string> = {
  CARDIAC: "Cardiac Emergency",
  STROKE: "Stroke Emergency",
  BREATHING: "Breathing Emergency",
  ALLERGIC: "Allergic Reaction",
  MENTAL_HEALTH: "Mental Health Crisis",
  GENERAL: "Medical Emergency",
};

export function DesktopSOS({ autoActivate = false, emergencyContext = null }: DesktopSOSProps) {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch("/api/sos/contacts");
        if (res.ok) {
          const data = await res.json();
          setContacts(data);
        }
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pt-8">
      {/* Emergency Banner - shown when auto-activated from chat */}
      {emergencyContext && (
        <div className="bg-red-600 text-white p-6 rounded-2xl shadow-2xl animate-pulse">
          <div className="flex items-center gap-4">
            <AlertTriangle className="w-10 h-10 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wide">
                {EMERGENCY_TYPE_LABELS[emergencyContext.type] || "Emergency Detected"}
              </h2>
              <p className="text-red-100 mt-1">
                Detected: {emergencyContext.detectedKeywords.join(", ")}
              </p>
              <p className="text-red-200 text-sm mt-2">
                Emergency services activated. Call 911 immediately if in danger.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 shadow-xl mx-auto mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 uppercase">Guardian SOS</h1>
        <p className="text-gray-500 dark:text-gray-400 font-light text-lg">Instant clinical escalation and emergency response protocols.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <CeramicCard tiltEffect={false} className="p-12 text-center flex flex-col items-center justify-center border-red-50 hover:border-red-100 bg-red-50/10">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-400 mb-10">Emergency Trigger</h2>
          <SOSButton initialContacts={contacts} autoActivate={autoActivate} />
          <p className="mt-10 text-xs text-red-400 font-light uppercase tracking-widest">Single-tap activation</p>
        </CeramicCard>

        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tighter">Emergency Nodes</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 font-light">Verified contacts notified during acute escalation.</p>
          </div>

          <EmergencyContacts contacts={contacts} />

          <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-3xl">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed font-light italic">
              * IN LIFE-THREATENING SCENARIOS, CALL LOCAL EMERGENCY SERVICES IMMEDIATELY. PLATFORM LATENCY MAY OCCUR.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
