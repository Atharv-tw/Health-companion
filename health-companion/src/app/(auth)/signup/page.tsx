"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CeramicCard } from "@/components/ui/CeramicCard";
import { ShimmerBackground } from "@/components/ui/ShimmerBackground";
import { Heart, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptConsent, setAcceptConsent] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!acceptConsent) {
      setError("You must accept the safety protocols to proceed.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, acceptConsent }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Establishment failed.");
        return;
      }

      // CHANGED: Redirect to login with automatic callback to /chat
      router.push("/login?registered=true&callbackUrl=/chat");
    } catch {
      setError("Establishment failed. Protocol error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-20 relative overflow-hidden">
      <ShimmerBackground />
      
      <div className="w-full max-w-xl space-y-8 relative z-50">
        {/* Branding */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 uppercase text-center">Join the Vanguard</h1>
          <p className="text-gray-500 font-light text-center">Establish your secure bio-digital identity.</p>
        </div>

        <CeramicCard className="p-8" tiltEffect={false}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 text-[11px] font-bold uppercase tracking-widest text-red-500 bg-red-50 border border-red-100 rounded-xl text-center"
              >
                {error}
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Official Name</Label>
                <Input
                  id="name"
                  placeholder="Clinical ID"
                  className="h-12 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Identity (Email)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@nexus.com"
                  className="h-12 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password" title="At least 8 characters" className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">New Key</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-12 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Confirm Key</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="h-12 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Safety Protocol */}
            <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Safety Protocol 1.0</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed font-light italic">
                "I acknowledge that Health Companion is an information system, not a clinical diagnostic tool. Critical symptoms require immediate human medical attention."
              </p>
              
              <div 
                className="flex items-center space-x-3 pt-2 cursor-pointer group/consent"
                onClick={() => !isLoading && setAcceptConsent(!acceptConsent)}
              >
                <div className="relative flex items-center justify-center">
                  <div className={cn(
                    "w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center",
                    acceptConsent ? "bg-primary border-primary" : "bg-white border-gray-200 group-hover/consent:border-primary/50"
                  )}>
                    {acceptConsent && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2.5 h-2.5 bg-white rounded-sm"
                      />
                    )}
                  </div>
                  {/* Real hidden checkbox for form state/accessibility */}
                  <input
                    type="checkbox"
                    id="consent"
                    checked={acceptConsent}
                    onChange={() => {}} // Controlled by parent div click
                    className="sr-only"
                    disabled={isLoading}
                  />
                </div>
                <span className="text-[11px] text-gray-600 font-bold uppercase tracking-widest group-hover/consent:text-primary transition-colors select-none">
                  Agree to Safety Protocol
                </span>
              </div>
            </div>

            <Button type="submit" className="w-full h-14 rounded-2xl bg-gray-900 text-white hover:bg-black font-bold uppercase tracking-widest text-[11px] shadow-2xl transition-all active:scale-95" disabled={isLoading || !acceptConsent}>
              {isLoading ? "Synchronizing..." : "Establish Identity"}
            </Button>
          </form>
        </CeramicCard>

        <p className="text-center text-sm text-gray-500">
          Already established?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}