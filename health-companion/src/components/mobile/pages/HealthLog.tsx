"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SymptomInput } from "@/components/health/SymptomInput";
import { VitalsInput } from "@/components/health/VitalsInput";
import { LifestyleInput } from "@/components/health/LifestyleInput";
import { HealthLogInput } from "@/lib/validators";
import { RiskCard, RiskAssessmentData } from "@/components/health/RiskCard";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2, Heart, Activity, Sparkles, ClipboardList } from "lucide-react";
import Link from "next/link";

type Step = "symptoms" | "vitals" | "lifestyle" | "review" | "result";

export function MobileHealthLog() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("symptoms");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setError] = useState("");
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessmentData | null>(null);

  const [formData, setFormData] = useState<HealthLogInput>({
    symptoms: { items: [], freeText: "" },
    vitals: {},
    lifestyle: {},
  });

  const steps: { key: Step; label: string; icon: any }[] = [
    { key: "symptoms", label: "Symptoms", icon: Heart },
    { key: "vitals", label: "Vitals", icon: Activity },
    { key: "lifestyle", label: "Life", icon: Sparkles },
    { key: "review", label: "Verify", icon: ClipboardList },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/health/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Sync failed.");
      }

      setRiskAssessment(data.riskAssessment);
      setCurrentStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAF9] pb-32">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-6 py-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <span className="font-bold text-[10px] uppercase tracking-[0.3em] text-gray-400">Log Protocol</span>
        <div className="w-10" />
      </div>

      <main className="flex-1 pt-20 px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="space-y-8 pt-4"
          >
            {currentStep !== "result" && (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {(() => {
                      const StepIcon = steps[currentStepIndex].icon;
                      return StepIcon ? <StepIcon className="w-4 h-4" /> : null;
                    })()}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tighter uppercase">{steps[currentStepIndex].label}</h2>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            )}

            <div className="min-h-[40vh]">
              {currentStep === "symptoms" && (
                <SymptomInput
                  value={formData.symptoms}
                  onChange={(symptoms) => setFormData({ ...formData, symptoms })}
                />
              )}

              {currentStep === "vitals" && (
                <VitalsInput
                  value={formData.vitals}
                  onChange={(vitals) => setFormData({ ...formData, vitals })}
                />
              )}

              {currentStep === "lifestyle" && (
                <LifestyleInput
                  value={formData.lifestyle}
                  onChange={(lifestyle) => setFormData({ ...formData, lifestyle })}
                />
              )}

              {currentStep === "review" && (
                <div className="space-y-4">
                  <MobileReviewItem title="Symptoms" value={formData.symptoms.items.length > 0 ? `${formData.symptoms.items.length} reported` : "None"} />
                  <MobileReviewItem title="Biometrics" value={Object.keys(formData.vitals || {}).length > 0 ? "Data entered" : "None"} />
                  <MobileReviewItem title="Environment" value={Object.keys(formData.lifestyle || {}).length > 0 ? "Data entered" : "None"} />
                </div>
              )}

              {currentStep === "result" && (
                <div className="space-y-8">
                  <div className="p-10 bg-white border border-white shadow-2xl rounded-[3rem] text-center space-y-4">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                    <h3 className="text-2xl font-bold text-gray-900 uppercase tracking-tight leading-none">Sync Successful</h3>
                    <p className="text-gray-500 font-light text-sm">Clinical analysis generated below.</p>
                  </div>
                  {riskAssessment && <RiskCard assessment={riskAssessment} showDetails={true} />}
                  
                  <div className="space-y-3 pt-4">
                    <Button className="w-full h-16 rounded-[2rem] bg-gray-900 text-white font-bold uppercase tracking-widest text-[11px]" onClick={() => router.push("/chat")}>
                      Open AI Oracle
                    </Button>
                    <Button variant="outline" className="w-full h-16 rounded-[2rem] bg-white border-gray-100 text-gray-500 font-bold uppercase tracking-widest text-[11px]" onClick={() => {
                      setCurrentStep("symptoms");
                      setFormData({ symptoms: { items: [], freeText: "" }, vitals: {}, lifestyle: {} });
                      setRiskAssessment(null);
                    }}>
                      New Entry
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {currentStep !== "result" && (
        <div className="fixed bottom-24 left-0 right-0 px-6 z-50">
          <div className="flex gap-3">
            {currentStepIndex > 0 && (
              <Button 
                variant="outline" 
                className="h-16 w-16 rounded-3xl bg-white border-white shadow-xl flex items-center justify-center p-0"
                onClick={handleBack}
              >
                <ChevronLeft className="w-6 h-6 text-gray-400" />
              </Button>
            )}
            
            <Button 
              className="flex-1 h-16 rounded-3xl bg-gray-900 text-white font-bold uppercase tracking-widest text-[11px] shadow-2xl"
              onClick={currentStep === "review" ? handleSubmit : handleNext}
              disabled={isSubmitting}
            >
              {currentStep === "review" ? (isSubmitting ? "Syncing..." : "Commit Log") : "Continue"}
              {currentStep !== "review" && <ChevronRight className="ml-2 w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileReviewItem({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-6 bg-white border border-white shadow-lg rounded-3xl">
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{title}</span>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  );
}
