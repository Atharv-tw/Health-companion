"use client";

import { useDevice } from "@/lib/useDevice";
import { DesktopReminders } from "@/components/desktop/pages/Reminders";
import { MobileReminders } from "@/components/mobile/pages/Reminders";
import { motion, AnimatePresence } from "framer-motion";

export default function RemindersPage() {
  const { isMobile } = useDevice();

  if (isMobile === null) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 bg-primary/20 rounded-full blur-xl"
        />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isMobile ? "mobile" : "desktop"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        {isMobile ? <MobileReminders /> : <DesktopReminders />}
      </motion.div>
    </AnimatePresence>
  );
}
