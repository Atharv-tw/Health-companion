"use client";

import { motion } from "framer-motion";

interface HealthOrbProps {
  status: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY" | null;
}

export function HealthOrb({ status }: HealthOrbProps) {
  let color = "bg-green-400"; // Low/Null
  let glowColor = "shadow-green-400/50";
  let pulseDuration = 4; // Slow breath

  if (status === "MEDIUM") {
    color = "bg-yellow-400";
    glowColor = "shadow-yellow-400/50";
    pulseDuration = 2;
  } else if (status === "HIGH") {
    color = "bg-orange-500";
    glowColor = "shadow-orange-500/50";
    pulseDuration = 1;
  } else if (status === "EMERGENCY") {
    color = "bg-red-600";
    glowColor = "shadow-red-600/50";
    pulseDuration = 0.5; // Fast panic
  }

  return (
    <div className="relative flex items-center justify-center w-32 h-32 mx-auto">
      {/* Core Orb */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: pulseDuration, repeat: Infinity, ease: "easeInOut" }}
        className={`w-16 h-16 rounded-full ${color} shadow-lg ${glowColor} z-10`}
      />
      
      {/* Outer Ripple 1 */}
      <motion.div
        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
        transition={{ duration: pulseDuration, repeat: Infinity, ease: "easeOut" }}
        className={`absolute w-16 h-16 rounded-full ${color} opacity-30`}
      />
      
      {/* Outer Ripple 2 */}
      <motion.div
        animate={{ scale: [1, 2], opacity: [0.3, 0] }}
        transition={{ duration: pulseDuration, repeat: Infinity, delay: 0.5, ease: "easeOut" }}
        className={`absolute w-16 h-16 rounded-full ${color} opacity-20`}
      />
    </div>
  );
}
