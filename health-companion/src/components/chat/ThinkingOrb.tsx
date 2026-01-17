"use client";

import { motion } from "framer-motion";

interface ThinkingOrbProps {
  isThinking: boolean;
}

export function ThinkingOrb({ isThinking }: ThinkingOrbProps) {
  if (!isThinking) return null;

  return (
    <div className="flex items-center justify-center w-full py-8">
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -8, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.15,
            }}
            className="w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 shadow-lg shadow-blue-500/30"
          />
        ))}
      </div>
    </div>
  );
}