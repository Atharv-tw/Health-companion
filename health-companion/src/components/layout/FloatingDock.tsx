"use client";

import { motion } from "framer-motion";
import { 
  Home, 
  MessageCircle, 
  Activity, 
  FileText, 
  Bell, 
  AlertCircle 
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Log Health", href: "/log", icon: Activity },
  { name: "Chat AI", href: "/chat", icon: MessageCircle },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Reminders", href: "/reminders", icon: Bell },
  { name: "SOS", href: "/sos", icon: AlertCircle, alert: true },
];

export function FloatingDock() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="flex items-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl shadow-blue-900/5 rounded-full"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/30" 
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                  item.alert && !isActive && "text-red-500 hover:bg-red-50 hover:text-red-600"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
                
                {/* Active Indicator Dot */}
                {isActive && (
                  <motion.div
                    layoutId="activeDot"
                    className="absolute -bottom-1 w-1 h-1 bg-white rounded-full opacity-0" 
                  />
                )}
                
                {/* Tooltip (Simple) */}
                <span className="absolute -top-10 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {item.name}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}
