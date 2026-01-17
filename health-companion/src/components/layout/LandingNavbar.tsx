"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/methodology", label: "Methodology" },
  { href: "/security", label: "Security" },
];

export function LandingNavbar() {
  const pathname = usePathname();

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between w-full max-w-4xl px-6 py-2.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl border border-white/40 dark:border-gray-700/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.03)] rounded-full pointer-events-auto"
      >
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full overflow-hidden shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
            <Image src="/logo.jpeg" alt="Health Companion" width={32} height={32} className="w-full h-full object-cover" />
          </div>
          <span className="text-[13px] font-bold uppercase tracking-[0.2em] text-gray-900 dark:text-gray-100 hidden sm:block">
            Health Companion
          </span>
        </Link>

        {/* Center: Links */}
        <div className="flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative text-[11px] font-bold uppercase tracking-[0.15em] transition-colors py-1",
                pathname === link.href ? "text-primary" : "text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              )}
            >
              {link.label}
              {pathname === link.href && (
                <motion.div 
                  layoutId="navPillActive"
                  className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-primary/40 rounded-full"
                />
              )}
            </Link>
          ))}
        </div>

        {/* Right: Auth */}
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" className="h-8 px-4 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-primary">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="h-8 px-5 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-white text-[10px] font-bold uppercase tracking-widest shadow-lg">
              Join
            </Button>
          </Link>
        </div>
      </motion.nav>
    </div>
  );
}