"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CeramicCard } from "@/components/ui/CeramicCard";
import { SymptomInput } from "@/components/health/SymptomInput";
import { VitalsInput } from "@/components/health/VitalsInput";
import { LifestyleInput } from "@/components/health/LifestyleInput";
import { HealthLogInput } from "@/lib/validators";
import { RiskCard, RiskAssessmentData } from "@/components/health/RiskCard";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardList, Activity, Heart, Sparkles } from "lucide-react";

type Step = "symptoms" | "vitals" | "lifestyle" | "review" | "result";

export function DesktopHealthLog() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("symptoms");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessmentData | null>(null);

  const [formData, setFormData] = useState<HealthLogInput>({
    symptoms: { items: [], freeText: "" },
    vitals: {},
    lifestyle: {},
  });

  const steps: { key: Step; label: string; icon: any }[] = [
    { key: "symptoms", label: "Symptoms", icon: Heart },
    { key: "vitals", label: "Vitals", icon: Activity },
    { key: "lifestyle", label: "Lifestyle", icon: Sparkles },
    { key: "review", label: "Review", icon: ClipboardList },
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
        throw new Error(data.error || "Failed to submit health log");
      }

      setRiskAssessment(data.riskAssessment);
      setCurrentStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pt-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 uppercase">Vitality Synchronization</h1>
        <p className="text-gray-500 dark:text-gray-400 font-light text-lg">Initialize your biometric data stream for clinical analysis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.5fr] gap-12">
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isActive = currentStep === step.key;
            const isCompleted = index < currentStepIndex;
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                className={`flex items-center gap-4 p-4 rounded-3xl transition-all duration-300 ${isActive ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white/50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500'}`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Phase 0{index + 1}</p>
                  <h3 className="font-bold uppercase text-sm tracking-tighter">{step.label}</h3>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-8">
          {error && (
            <div className="p-4 text-[11px] font-bold uppercase tracking-widest text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-3xl">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === "result" ? (
                <div className="space-y-8">
                  <div className="p-8 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-[3rem] text-center space-y-2">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tighter">Synchronization Complete</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-light">Your health log has been verified and sharded.</p>
                  </div>
                  {riskAssessment && <RiskCard assessment={riskAssessment} showDetails={true} />}
                  
                  <div className="flex justify-center gap-4 pt-8">
                    <Button variant="outline" className="rounded-full px-8 h-12 uppercase text-[10px] font-bold tracking-widest" onClick={() => router.push("/chat")}>
                      Open AI Oracle
                    </Button>
                    <Button className="rounded-full px-8 h-12 uppercase text-[10px] font-bold tracking-widest" onClick={() => {
                      setCurrentStep("symptoms");
                      setFormData({ symptoms: { items: [], freeText: "" }, vitals: {}, lifestyle: {} });
                      setRiskAssessment(null);
                    }}>
                      New Entry
                    </Button>
                  </div>
                </div>
              ) : (
                <CeramicCard tiltEffect={false} className="p-10 space-y-10">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tighter">
                      {currentStep === "symptoms" && "Symptom Acquisition"}
                      {currentStep === "vitals" && "Biometric Measurements"}
                      {currentStep === "lifestyle" && "Environmental Factors"}
                      {currentStep === "review" && "Logic Verification"}
                    </h2>
                    <p className="text-gray-400 dark:text-gray-500 font-light text-sm">
                      {currentStep === "symptoms" && "Select acute or persistent symptoms from the clinical registry."}
                      {currentStep === "vitals" && "Input specific measurements. Standard ranges will be applied during analysis."}
                      {currentStep === "lifestyle" && "Daily habits significantly influence neural risk interpretations."}
                      {currentStep === "review" && "Verify all data points before final cryptographic submission."}
                    </p>
                  </div>

                  <div className="min-h-[300px]">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                        <ReviewSection title="Symptomatic Data" data={formData.symptoms.items.map(i => i.name).join(", ") || "None"} />
                        <ReviewSection title="Biometrics" data={Object.entries(formData.vitals || {}).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(" | ") || "None"} />
                        <ReviewSection title="Environment" data={Object.entries(formData.lifestyle || {}).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(" | ") || "None"} />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-8 border-t border-gray-50">
                    <Button
                      variant="ghost"
                      className="rounded-full px-6 h-12 uppercase text-[10px] font-bold tracking-widest text-gray-400 hover:text-gray-900"
                      onClick={handleBack}
                      disabled={currentStepIndex === 0}
                    >
                      <ArrowLeft className="mr-2 w-4 h-4" /> Back
                    </Button>

                    {currentStep !== "review" ? (
                      <Button className="rounded-full px-8 h-12 uppercase text-[10px] font-bold tracking-widest bg-gray-900 text-white" onClick={handleNext}>
                        Continue <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    ) : (
                      <Button className="rounded-full px-10 h-12 uppercase text-[10px] font-bold tracking-widest bg-primary text-white shadow-xl shadow-primary/20" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Processing..." : "Commit Data Stream"}
                      </Button>
                    )}
                  </div>
                </CeramicCard>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ReviewSection({ title, data }: { title: string; data: string }) {
  return (
    <div className="p-6 bg-gray-50 rounded-3xl space-y-2 border border-gray-100">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">{title}</h4>
      <p className="text-gray-600 font-medium">{data}</p>
    </div>
  );
}
