"use client";

import { useEffect, useState } from "react";
import ReminderList from "@/components/reminders/ReminderList";
import { Bell } from "lucide-react";

export function DesktopReminders() {
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-4xl mx-auto pt-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 uppercase">Chronos Protocol</h1>
        <p className="text-gray-500 dark:text-gray-400 font-light text-lg">Automated reminders for clinical adherence and health habits.</p>
      </div>

      <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 p-10 rounded-[3rem] shadow-2xl">
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-6 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Bell className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tighter">Adherence Schedule</h2>
        </div>
        
        <ReminderList initialReminders={reminders} />
      </div>
    </div>
  );
}
