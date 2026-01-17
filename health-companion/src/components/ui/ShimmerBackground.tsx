"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function ShimmerBackground() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  // In dark mode, use a simple clean background
  if (isDark) {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden bg-gray-900 pointer-events-none" />
    );
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#FAFAF9] pointer-events-none">
      {/* Base Iridescent Silk Layer */}
      <motion.div
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 opacity-[0.4] bg-[radial-gradient(at_0%_0%,_oklch(0.95_0.02_250)_0px,_transparent_50%),_radial-gradient(at_50%_0%,_oklch(0.98_0.01_100)_0px,_transparent_50%),_radial-gradient(at_100%_0%,_oklch(0.95_0.03_300)_0px,_transparent_50%),_radial-gradient(at_0%_100%,_oklch(0.96_0.02_150)_0px,_transparent_50%),_radial-gradient(at_100%_100%,_oklch(0.98_0.02_50)_0px,_transparent_50%)]"
        style={{ backgroundSize: "200% 200%" }}
      />

      {/* Floating Glassy Shimmers (Light Streaks) */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            x: ["-100%", "200%"],
            y: ["-20%", "120%"],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 12 + i * 5,
            repeat: Infinity,
            delay: i * 4,
            ease: "easeInOut",
          }}
          className="absolute w-[40%] h-[100%] bg-gradient-to-r from-transparent via-white to-transparent rotate-[35deg] blur-[100px]"
        />
      ))}

      {/* Noise Texture for that "Analog/Premium" feel */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* The "Pulsing Aura" behind main content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] animate-pulse" />
    </div>
  );
}