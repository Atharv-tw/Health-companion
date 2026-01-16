"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface CeramicCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number; // For staggered entrance
  hoverEffect?: boolean;
}

export function CeramicCard({ 
  children, 
  className, 
  delay = 0,
  hoverEffect = true,
  ...props 
}: CeramicCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: delay, 
        type: "spring", 
        stiffness: 100 
      }}
      whileHover={hoverEffect ? { 
        y: -5, 
        boxShadow: "0 20px 40px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)" 
      } : undefined}
      className={cn(
        "bg-card text-card-foreground rounded-3xl p-6",
        "border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]", // Soft ethereal shadow
        "backdrop-blur-sm bg-white/80", // Slight transparency
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
