"use client";

import { useEffect, useState } from "react";
import SOSButton from "@/components/sos/SOSButton";
import EmergencyContacts from "@/components/sos/EmergencyContacts";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function MobileSOS() {
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
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-10 h-10 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAF9] pb-32">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-6 py-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <span className="font-bold text-[10px] uppercase tracking-[0.3em] text-red-500">SOS Guard</span>
        <div className="w-10" />
      </div>

      <main className="flex-1 pt-24 px-6 space-y-12 flex flex-col items-center">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tighter text-gray-900 leading-[0.9] uppercase">
            Acute <br />
            <span className="text-red-600">Distress.</span>
          </h1>
        </div>

        <div className="scale-125 py-10">
          <SOSButton initialContacts={contacts} />
        </div>

        <div className="w-full space-y-8">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tighter text-center">Protocol Nodes</h2>
          </div>
          
          <div className="bg-white border border-white shadow-2xl rounded-[2.5rem] p-6">
            <EmergencyContacts contacts={contacts} />
          </div>
        </div>
      </main>
    </div>
  );
}
