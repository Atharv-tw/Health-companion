"use client";

import { useEffect, useState } from "react";
import SOSButton from "@/components/sos/SOSButton";
import EmergencyContacts from "@/components/sos/EmergencyContacts";
import { ShieldAlert } from "lucide-react";
import { CeramicCard } from "@/components/ui/CeramicCard";

export function DesktopSOS() {
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
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shadow-xl mx-auto mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 uppercase">Guardian SOS</h1>
        <p className="text-gray-500 font-light text-lg">Instant clinical escalation and emergency response protocols.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <CeramicCard tiltEffect={false} className="p-12 text-center flex flex-col items-center justify-center border-red-50 hover:border-red-100 bg-red-50/10">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-400 mb-10">Emergency Trigger</h2>
          <SOSButton initialContacts={contacts} />
          <p className="mt-10 text-xs text-red-400 font-light uppercase tracking-widest">Single-tap activation</p>
        </CeramicCard>

        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tighter">Emergency Nodes</h2>
            <p className="text-sm text-gray-400 font-light">Verified contacts notified during acute escalation.</p>
          </div>
          
          <EmergencyContacts contacts={contacts} />
          
          <div className="p-6 bg-gray-50 border border-gray-100 rounded-3xl">
            <p className="text-[10px] text-gray-400 leading-relaxed font-light italic">
              * IN LIFE-THREATENING SCENARIOS, CALL LOCAL EMERGENCY SERVICES IMMEDIATELY. PLATFORM LATENCY MAY OCCUR.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
