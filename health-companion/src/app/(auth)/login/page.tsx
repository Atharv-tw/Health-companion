"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CeramicCard } from "@/components/ui/CeramicCard";
import { ShimmerBackground } from "@/components/ui/ShimmerBackground";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // CHANGED: Default redirect to /chat
  const callbackUrl = searchParams.get("callbackUrl") || "/chat";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Branding */}
      <div className="text-center space-y-4">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Heart className="w-6 h-6 text-white" />
          </div>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 uppercase">Authorize Access</h1>
        <p className="text-gray-500 font-light">Securely enter the Health Companion Oracle.</p>
      </div>

      <CeramicCard className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-3 text-[11px] font-bold uppercase tracking-widest text-red-500 bg-red-50 border border-red-100 rounded-xl"
            >
              {error}
            </motion.div>
          )}
          
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

          <div className="space-y-2">
            <Label htmlFor="password" title="Enter Password" className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Key (Password)</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="h-12 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full h-12 rounded-2xl bg-gray-900 text-white hover:bg-black font-bold uppercase tracking-widest text-[11px] shadow-xl transition-all active:scale-95" disabled={isLoading}>
            {isLoading ? "Authenticating..." : "Establish Session"}
          </Button>
        </form>
      </CeramicCard>

      <p className="text-center text-sm text-gray-500">
        New to the Vanguard?{" "}
        <Link href="/signup" className="text-primary font-bold hover:underline">
          Join Now
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      <ShimmerBackground />
      <Suspense fallback={<div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}