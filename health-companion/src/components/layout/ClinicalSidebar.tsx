"use client";

import { motion } from "framer-motion";
import {
  Home,
  MessageCircle,
  Activity,
  FileText,
  Bell,
  AlertCircle,
  Heart,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { name: "Oracle Chat", href: "/chat", icon: MessageCircle, primary: true },
  { name: "Vitality Profile", href: "/dashboard", icon: Home },
  { name: "Health Log", href: "/log", icon: Activity },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Reminders", href: "/reminders", icon: Bell },
  { name: "Guardian SOS", href: "/sos", icon: AlertCircle, alert: true },
];

export function ClinicalSidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed top-0 left-0 bottom-0 w-24 z-50 flex flex-col items-center py-10 bg-white/40 backdrop-blur-3xl border-r border-gray-100 shadow-[10px_0_50px_rgba(0,0,0,0.02)]">
      {/* Branding Logo */}
      <Link href="/" className="mb-12 group">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-all">
          <Heart className="w-6 h-6 text-white" />
        </div>
      </Link>

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col gap-6">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="group relative">
              <motion.div
                whileHover={{ scale: 1.1, x: 2 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                  isActive 
                    ? "bg-primary text-white shadow-xl shadow-primary/25" 
                    : "text-gray-400 hover:text-gray-900 hover:bg-gray-100/50",
                  item.alert && !isActive && "text-red-400 hover:text-red-600 hover:bg-red-50",
                  item.primary && !isActive && "text-primary bg-primary/5"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
                
                {/* Active Indicator Bar */}
                {isActive && (
                  <motion.div 
                    layoutId="sideActive"
                    className="absolute -left-6 w-1 h-8 bg-primary rounded-r-full"
                  />
                )}

                {/* Tooltip (Right-Side) */}
                <div className="absolute left-16 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                    {item.name}
                  </div>
                  <div className="w-2 h-2 bg-gray-900 rotate-45 absolute -left-1 top-1/2 -translate-y-1/2" />
                </div>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <button 
        onClick={() => signOut({ callbackUrl: "/" })}
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all group relative"
      >
        <LogOut className="w-5 h-5" />
        <div className="absolute left-16 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
            Sign Out
          </div>
          <div className="w-2 h-2 bg-gray-900 rotate-45 absolute -left-1 top-1/2 -translate-y-1/2" />
        </div>
      </button>
    </div>
  );
}
