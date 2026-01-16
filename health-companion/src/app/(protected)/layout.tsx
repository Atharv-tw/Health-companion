import { FloatingDock } from "@/components/layout/FloatingDock";
import { SessionProvider } from "@/components/providers/SessionProvider";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-background relative overflow-x-hidden selection:bg-primary/10">
        {/* Main Content Area */}
        <main className="container mx-auto px-4 pt-8 pb-32 min-h-screen">
            {/* We add pb-32 to ensure content isn't hidden behind the dock */}
            {children}
        </main>

        {/* Floating Navigation */}
        <FloatingDock />
      </div>
    </SessionProvider>
  );
}