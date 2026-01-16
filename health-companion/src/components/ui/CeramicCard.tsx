"use client";

import React, { useRef } from "react";
import { 
  motion, 
  useMotionValue, 
  useSpring, 
  useTransform,
  HTMLMotionProps 
} from "framer-motion";
import { cn } from "@/lib/utils";

interface CeramicCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
  hoverEffect?: boolean;
  tiltEffect?: boolean;
}

export function CeramicCard({ 
  children, 
  className, 
  delay = 0,
  hoverEffect = true,
  tiltEffect = true,
  ...props 
}: CeramicCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Mouse positions
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for rotation
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  // Transformations for 3D rotation (Increased from 10deg to 25deg)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["25deg", "-25deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-25deg", "25deg"]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltEffect || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate normalized mouse position (-0.5 to 0.5)
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: delay, 
        type: "spring", 
        stiffness: 100 
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: tiltEffect ? rotateX : 0,
        rotateY: tiltEffect ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      whileHover={hoverEffect ? { 
        y: -10, 
        boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.1), 0 18px 36px -18px rgba(0, 0, 0, 0.05)" 
      } : undefined}
      className={cn(
        "bg-card text-card-foreground rounded-3xl p-6",
        "border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
        "backdrop-blur-sm bg-white/80",
        "relative",
        className
      )}
      {...props}
    >
      <div 
        style={{ 
          transform: "translateZ(75px)",
          transformStyle: "preserve-3d"
        }} 
        className="relative z-10"
      >
        {children}
      </div>
    </motion.div>
  );
}