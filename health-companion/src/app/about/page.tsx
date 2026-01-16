"use client";

import { useDevice } from "@/lib/useDevice";
import { DesktopAbout } from "@/components/desktop/pages/About";
import { MobileAbout } from "@/components/mobile/pages/About";
import { motion, AnimatePresence } from "framer-motion";

export default function AboutPage() {
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
        {isMobile ? <MobileAbout /> : <DesktopAbout />}
      </motion.div>
    </AnimatePresence>
  );
}
