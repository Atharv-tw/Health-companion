"use client";

import { ClinicalSidebar } from "@/components/layout/ClinicalSidebar";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { useDevice } from "@/lib/useDevice";
import { FloatingDock } from "@/components/layout/FloatingDock";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isMobile } = useDevice();

  return (
    <SessionProvider>
      <div className="min-h-screen bg-background relative selection:bg-primary/10">
        {/* Render Sidebar for Desktop, FloatingDock for Mobile */}
        {!isMobile && <ClinicalSidebar />}
        {isMobile && <FloatingDock />}

        {/* Theme Toggle - Top Right */}
        <div className="fixed top-6 right-6 z-50">
          <ThemeToggle />
        </div>

        {/* Main Content Area with offset for Sidebar on Desktop */}
        <main className={isMobile ? "container mx-auto px-4 pt-8 pb-32 min-h-screen" : "pl-24 pt-0 min-h-screen"}>
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
