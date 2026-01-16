"use client";

import { useDevice } from "@/lib/useDevice";
import { DesktopHome } from "@/components/desktop/pages/Home";
import { MobileHome } from "@/components/mobile/pages/Home";
import { motion, AnimatePresence } from "framer-motion";

export default function Page() {
  const { isMobile } = useDevice();

  // Show a clean loading state during detection to prevent flash of wrong UI
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
      >
        {isMobile ? <MobileHome /> : <DesktopHome />}
      </motion.div>
    </AnimatePresence>
  );
}
