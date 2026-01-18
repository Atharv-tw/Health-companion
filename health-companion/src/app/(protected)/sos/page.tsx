"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDevice } from "@/lib/useDevice";
import { DesktopSOS } from "@/components/desktop/pages/SOS";
import { MobileSOS } from "@/components/mobile/pages/SOS";
import { motion, AnimatePresence } from "framer-motion";
import { EmergencyContext } from "@/types/emergency";

function SOSContent() {
  const { isMobile } = useDevice();
  const searchParams = useSearchParams();
  const [emergencyContext, setEmergencyContext] = useState<EmergencyContext | null>(null);

  // Check if this is an emergency redirect
  const isEmergency = searchParams.get('emergency') === 'true';

  // Read emergency context from sessionStorage on mount
  useEffect(() => {
    if (isEmergency) {
      try {
        const storedContext = sessionStorage.getItem('emergencyContext');
        if (storedContext) {
          setEmergencyContext(JSON.parse(storedContext));
          // Clear after reading
          sessionStorage.removeItem('emergencyContext');
        }
      } catch (error) {
        console.error('Failed to parse emergency context:', error);
      }
    }
  }, [isEmergency]);

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
        {isMobile ? (
          <MobileSOS autoActivate={isEmergency} emergencyContext={emergencyContext} />
        ) : (
          <DesktopSOS autoActivate={isEmergency} emergencyContext={emergencyContext} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default function SOSPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 bg-primary/20 rounded-full blur-xl"
        />
      </div>
    }>
      <SOSContent />
    </Suspense>
  );
}
