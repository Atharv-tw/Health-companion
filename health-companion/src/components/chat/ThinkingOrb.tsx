"use client";

import { motion } from "framer-motion";

interface ThinkingOrbProps {
  isThinking: boolean;
}

export function ThinkingOrb({ isThinking }: ThinkingOrbProps) {
  return (
    <div className="relative flex items-center justify-center w-full py-10">
      <div className="relative">
        {/* The Core Fluid Blob */}
        <motion.div
          animate={isThinking ? {
            scale: [1, 1.2, 0.9, 1.1, 1],
            borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 50% 30% 70% 50%", "40% 60% 70% 30% / 40% 50% 60% 50%"],
            rotate: [0, 90, 180, 270, 360]
          } : {
            scale: 1,
            borderRadius: "50%",
            rotate: 0
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-24 h-24 bg-gradient-to-tr from-primary/20 via-blue-400/10 to-teal-300/20 backdrop-blur-xl border border-white/40 shadow-[0_0_50px_-10px_rgba(59,130,246,0.3)]"
        />

        {/* Thinking Pulse (Visible only when isThinking) */}
        {isThinking && (
          <>
            <motion.div
              animate={{ scale: [1, 2], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-primary/10 rounded-full blur-xl"
            />
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="absolute inset-0 bg-blue-400/10 rounded-full blur-lg"
            />
          </>
        )}
      </div>
    </div>
  );
}