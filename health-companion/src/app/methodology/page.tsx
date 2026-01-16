"use client";

import { useDevice } from "@/lib/useDevice";
import { DesktopMethodology } from "@/components/desktop/pages/Methodology";
import { MobileMethodology } from "@/components/mobile/pages/Methodology";
import { motion, AnimatePresence } from "framer-motion";

export default function MethodologyPage() {
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
        {isMobile ? <MobileMethodology /> : <DesktopMethodology />}
      </motion.div>
    </AnimatePresence>
  );
}