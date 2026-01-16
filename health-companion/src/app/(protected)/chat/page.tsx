"use client";

import { useDevice } from "@/lib/useDevice";
import { DesktopChat } from "@/components/desktop/pages/Chat";
import { MobileChat } from "@/components/mobile/pages/Chat";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatPage() {
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
        {isMobile ? <MobileChat /> : <DesktopChat />}
      </motion.div>
    </AnimatePresence>
  );
}