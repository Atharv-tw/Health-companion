"use client";

import { motion } from "framer-motion";
import {
  Home,
  MessageCircle,
  Activity,
  FileText,
  Bell,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Oracle Chat", href: "/chat", icon: MessageCircle, primary: true },
  { name: "Vitality Profile", href: "/dashboard", icon: Home },
  { name: "Health Log", href: "/log", icon: Activity },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Reminders", href: "/reminders", icon: Bell },
  { name: "Guardian SOS", href: "/sos", icon: AlertCircle, alert: true },
];

export function FloatingDock() {
  const pathname = usePathname();

  return (
    /* The trigger area: A wide invisible bar at the bottom */
    <motion.div
      className="fixed bottom-0 left-0 right-0 h-24 z-50 flex justify-center items-center group"
      initial="hidden"
      whileHover="visible"
    >
      <motion.div
        variants={{
          hidden: { y: 100, opacity: 0 },
          visible: { y: -32, opacity: 1 },
        }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="flex items-center gap-3 px-5 py-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-3xl border border-white/40 dark:border-gray-700/40 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-full"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="group/item relative">
              <motion.div
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                  isActive
                    ? "bg-primary text-white shadow-xl shadow-primary/25"
                    : "text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-gray-800/50",
                  item.alert && !isActive && "text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30",
                  item.primary && !isActive && "text-primary bg-primary/5 dark:bg-primary/10 border border-primary/10"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
                
                <div className="absolute -top-12 opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                    {item.name}
                  </div>
                  <div className="w-2 h-2 bg-gray-900 rotate-45 mx-auto -mt-1" />
                </div>
              </motion.div>
            </Link>
          );
        })}
      </motion.div>
    </motion.div>
  );
}