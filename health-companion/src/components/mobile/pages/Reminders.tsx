"use client";

import { useEffect, useState } from "react";
import ReminderList from "@/components/reminders/ReminderList";
import { Bell, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function MobileReminders() {
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const res = await fetch("/api/reminders");
        if (res.ok) {
          const data = await res.json();
          setReminders(data);
        }
      } catch (error) {
        console.error("Failed to fetch reminders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReminders();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
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
        <span className="font-bold text-[10px] uppercase tracking-[0.3em] text-gray-400">Reminders</span>
        <div className="w-10" />
      </div>

      <main className="flex-1 pt-24 px-6 space-y-8">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter text-gray-900 leading-[0.9] uppercase">
            Stay <br />
            <span className="text-primary">Sync'd.</span>
          </h1>
        </div>

        <div className="p-2">
          <ReminderList initialReminders={reminders} />
        </div>
      </main>
    </div>
  );
}
