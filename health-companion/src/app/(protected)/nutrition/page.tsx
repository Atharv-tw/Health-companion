"use client";

import { useDevice } from "@/lib/useDevice";
import { DesktopNutrition } from "@/components/desktop/pages/Nutrition";
import { MobileNutrition } from "@/components/mobile/pages/Nutrition";
import { motion, AnimatePresence } from "framer-motion";

export default function NutritionPage() {
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
        className="w-full"
      >
        {isMobile ? <MobileNutrition /> : <DesktopNutrition />}
      </motion.div>
    </AnimatePresence>
  );
}
