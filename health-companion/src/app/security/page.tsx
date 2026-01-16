"use client";

import { useDevice } from "@/lib/useDevice";
import { DesktopSecurity } from "@/components/desktop/pages/Security";
import { MobileSecurity } from "@/components/mobile/pages/Security";
import { motion, AnimatePresence } from "framer-motion";

export default function SecurityPage() {
  const { isMobile } = useDevice();

  if (isMobile === null) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isMobile ? "mobile" : "desktop"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {isMobile ? <MobileSecurity /> : <DesktopSecurity />}
      </motion.div>
    </AnimatePresence>
  );
}
