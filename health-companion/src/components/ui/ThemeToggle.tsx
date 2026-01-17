"use client";

import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-400">
        <Sun className="w-5 h-5" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-400 hover:text-amber-500 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-amber-50 dark:hover:bg-amber-950/30 shadow-lg shadow-black/5 transition-all group relative"
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {isDark ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </motion.div>

      {/* Tooltip - Left side */}
      <div className="absolute right-16 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
          {isDark ? "Light Mode" : "Dark Mode"}
        </div>
        <div className="w-2 h-2 bg-gray-900 rotate-45 absolute -right-1 top-1/2 -translate-y-1/2" />
      </div>
    </button>
  );
}
