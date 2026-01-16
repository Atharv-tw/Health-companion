"use client";

import { motion } from "framer-motion";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { ShimmerBackground } from "@/components/ui/ShimmerBackground";
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  Fingerprint, 
  Database, 
  Cpu, 
  Server,
  ChevronRight
} from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="relative min-h-screen">
      <ShimmerBackground />
      <LandingNavbar />
      
      <main className="pt-40 px-6 pb-32">
        {/* Section 1: Hero - The Core Enclave */}
        <section className="container mx-auto max-w-6xl mb-40">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 border-2 border-dashed border-primary/20 rounded-full flex items-center justify-center"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-32 h-32 border border-primary/10 rounded-full scale-125"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl text-primary border border-white/60">
                  <ShieldCheck className="w-8 h-8" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase bg-primary/5 px-4 py-1.5 rounded-full">
                Protocol: Secure Enclave
              </span>
              <h1 className="text-6xl md:text-8xl font-bold text-gray-900 tracking-tighter uppercase leading-none">
                Ironclad <br /> <span className="text-gray-300">Privacy.</span>
              </h1>
              <p className="text-xl text-gray-500 font-light max-w-2xl leading-relaxed">
                Health Companion uses a zero-trust architecture. Your medical data is encrypted at rest, in transit, and during computation.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Data Lifecycle (Structural Layout) */}
        <section className="container mx-auto max-w-6xl mb-40">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-16 text-center">Encryption Lifecycle</h2>
          
          <div className="grid md:grid-cols-3 gap-0 border border-gray-100 bg-white/30 backdrop-blur-md rounded-[3rem] overflow-hidden shadow-2xl">
            <LifecycleStep 
              icon={<Fingerprint className="w-6 h-6" />}
              title="Identity Shield"
              desc="All Personally Identifiable Information (PII) is decoupled from health logs using cryptographic hashing."
            />
            <LifecycleStep 
              icon={<Cpu className="w-6 h-6" />}
              title="Enclave Processing"
              desc="Computation occurs in isolated environments where even our system administrators cannot view the raw data."
            />
            <LifecycleStep 
              icon={<Lock className="w-6 h-6" />}
              title="AES-256 Storage"
              desc="Logs are sharded and stored using military-grade encryption standards across multiple secure nodes."
            />
          </div>
        </section>

        {/* Section 3: Compliance Grid (Sharp Technical Look) */}
        <section className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-12">
              <h3 className="text-4xl font-bold tracking-tighter text-gray-900 uppercase leading-none">Our Standards <br /> for Trust.</h3>
              <p className="text-gray-500 font-light leading-relaxed">
                We don't just follow guidelines; we build against the highest possible medical data standards globally.
              </p>
              
              <div className="space-y-6">
                <SecurityFeature title="HIPAA Compliant Infrastructure" />
                <SecurityFeature title="GDPR Data Subject Rights" />
                <SecurityFeature title="SOC2 Type II Operations" />
              </div>
            </div>

            <div className="relative p-1 bg-white/20 backdrop-blur-3xl border border-white/60 rounded-[2.5rem] shadow-xl overflow-hidden">
               {/* Animated Scanning Grid */}
               <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
               <motion.div 
                animate={{ y: ["0%", "100%", "0%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-0 w-full h-1 bg-primary/20 blur-sm"
               />
               
               <div className="relative p-8 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                      <Server className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-900">Infrastructure Node</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <motion.div animate={{ width: ["20%", "80%", "45%"] }} transition={{ duration: 5, repeat: Infinity }} className="h-full bg-primary" />
                    </div>
                    <div className="h-1.5 w-[70%] bg-gray-100 rounded-full overflow-hidden">
                      <motion.div animate={{ width: ["10%", "90%", "30%"] }} transition={{ duration: 7, repeat: Infinity }} className="h-full bg-blue-400" />
                    </div>
                    <div className="h-1.5 w-[90%] bg-gray-100 rounded-full overflow-hidden">
                      <motion.div animate={{ width: ["40%", "100%", "60%"] }} transition={{ duration: 4, repeat: Infinity }} className="h-full bg-teal-400" />
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-400 font-mono leading-relaxed">
                    SYSTEM_STATUS: NOMINAL <br />
                    ENCRYPTION_LAYER: ACTIVE <br />
                    ENCLAVE_ACCESS: RESTRICTED <br />
                    AUDIT_LOGGING: SYNCHRONIZED
                  </p>
               </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function LifecycleStep({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-12 border-r last:border-r-0 border-gray-100/50 hover:bg-white/40 transition-colors group">
      <div className="w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight mb-4">{title}</h3>
      <p className="text-sm text-gray-500 font-light leading-relaxed">{desc}</p>
    </div>
  );
}

function SecurityFeature({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 group cursor-default">
      <span className="text-sm font-bold uppercase tracking-widest text-gray-400 group-hover:text-primary transition-colors">{title}</span>
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
    </div>
  );
}