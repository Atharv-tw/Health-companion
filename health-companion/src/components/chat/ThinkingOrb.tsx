"use client";

import { motion } from "framer-motion";

interface ThinkingOrbProps {
  isThinking: boolean;
}

export function ThinkingOrb({ isThinking }: ThinkingOrbProps) {
  return (
    <div className="relative flex items-center justify-center w-full py-10">
      <div className="relative">
        {/* Outer Glow Ring */}
        <motion.div
          animate={isThinking ? {
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          } : {
            scale: 1,
            opacity: 0.2,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary/40 via-blue-500/30 to-teal-400/40 dark:from-primary/50 dark:via-blue-400/40 dark:to-teal-300/50 blur-2xl"
        />

        {/* The Core Fluid Blob */}
        <motion.div
          initial={{ borderRadius: "50%" }}
          animate={isThinking ? {
            scale: [1, 1.15, 0.95, 1.1, 1],
            borderRadius: ["50%", "40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 50% 30% 70% 50%", "30% 70% 40% 60% / 60% 40% 70% 30%", "50%"],
            rotate: [0, 45, 90, 135, 180]
          } : {
            scale: [1, 1.02, 1],
            borderRadius: "50%",
            rotate: 0
          }}
          transition={isThinking ? {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          } : {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            borderRadius: { duration: 0.5 }
          }}
          style={{ borderRadius: "50%" }}
          className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-primary/50 via-blue-500/40 to-teal-400/50 dark:from-primary/60 dark:via-blue-400/50 dark:to-teal-300/60 backdrop-blur-xl border-2 border-primary/30 dark:border-primary/50 shadow-[0_0_40px_-5px_rgba(59,130,246,0.5)] dark:shadow-[0_0_50px_-5px_rgba(59,130,246,0.7)]"
        >
          {/* Inner highlight */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent dark:from-white/20" />

          {/* Center dot */}
          <motion.div
            animate={isThinking ? {
              scale: [1, 1.5, 1],
              opacity: [0.8, 1, 0.8],
            } : {
              scale: 1,
              opacity: 0.6,
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white dark:bg-white shadow-lg"
          />
        </motion.div>

        {/* Thinking Pulse Rings (Visible only when isThinking) */}
        {isThinking && (
          <>
            <motion.div
              animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
              className="absolute inset-0 bg-primary/30 dark:bg-primary/40 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 2], opacity: [0.4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
              className="absolute inset-0 bg-blue-500/25 dark:bg-blue-400/35 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
              className="absolute inset-0 bg-teal-400/20 dark:bg-teal-300/30 rounded-full"
            />
          </>
        )}

        {/* Orbiting particles when thinking */}
        {isThinking && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary/80 dark:bg-primary shadow-lg shadow-primary/50" />
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500/80 dark:bg-blue-400 shadow-lg shadow-blue-500/50" />
            </motion.div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-teal-400/80 dark:bg-teal-300 shadow-lg shadow-teal-400/50" />
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}