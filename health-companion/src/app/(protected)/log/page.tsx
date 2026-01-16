"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SymptomInput } from "@/components/health/SymptomInput";
import { VitalsInput } from "@/components/health/VitalsInput";
import { LifestyleInput } from "@/components/health/LifestyleInput";
import { HealthLogInput } from "@/lib/validators";
import { RiskCard, RiskAssessmentData } from "@/components/health/RiskCard";

type Step = "symptoms" | "vitals" | "lifestyle" | "review" | "result";

export default function LogPage() {
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

  const steps: { key: Step; label: string }[] = [
    { key: "symptoms", label: "Symptoms" },
    { key: "vitals", label: "Vitals" },
    { key: "lifestyle", label: "Lifestyle" },
    { key: "review", label: "Review" },
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

      // Show risk assessment result
      setRiskAssessment(data.riskAssessment);
      setCurrentStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Log Health</h1>
        <p className="text-gray-600 mt-1">
          Record your symptoms, vitals, and lifestyle information.
        </p>
      </div>

      {/* Progress Steps - Hidden on result */}
      {currentStep !== "result" && (
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  index <= currentStepIndex
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`ml-2 text-sm hidden sm:inline ${
                  index <= currentStepIndex ? "text-blue-600 font-medium" : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 sm:w-24 h-1 mx-2 ${
                    index < currentStepIndex ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {currentStep !== "result" && (
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === "symptoms" && "What symptoms are you experiencing?"}
              {currentStep === "vitals" && "Record your vital signs"}
              {currentStep === "lifestyle" && "Lifestyle factors"}
              {currentStep === "review" && "Review your entry"}
            </CardTitle>
            <CardDescription>
              {currentStep === "symptoms" && "Select from common symptoms or add your own"}
              {currentStep === "vitals" && "Enter any measurements you have (all optional)"}
              {currentStep === "lifestyle" && "Help us understand factors affecting your health"}
              {currentStep === "review" && "Confirm your health log before submitting"}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
            <div className="space-y-6">
              {/* Symptoms Summary */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Symptoms</h4>
                {formData.symptoms.items.length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {formData.symptoms.items.map((item) => (
                      <li key={item.name}>
                        {item.name} - {item.severity}
                        {item.duration && ` (${item.duration})`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No symptoms reported</p>
                )}
                {formData.symptoms.freeText && (
                  <p className="text-sm text-gray-600 mt-2 italic">
                    &quot;{formData.symptoms.freeText}&quot;
                  </p>
                )}
              </div>

              {/* Vitals Summary */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Vitals</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {formData.vitals?.heartRate && (
                    <p className="text-gray-600">Heart Rate: {formData.vitals.heartRate} bpm</p>
                  )}
                  {formData.vitals?.temperature && (
                    <p className="text-gray-600">Temperature: {formData.vitals.temperature}°C</p>
                  )}
                  {formData.vitals?.bpSystolic && formData.vitals?.bpDiastolic && (
                    <p className="text-gray-600">
                      Blood Pressure: {formData.vitals.bpSystolic}/{formData.vitals.bpDiastolic} mmHg
                    </p>
                  )}
                  {formData.vitals?.spO2 && (
                    <p className="text-gray-600">SpO2: {formData.vitals.spO2}%</p>
                  )}
                </div>
                {!formData.vitals?.heartRate &&
                  !formData.vitals?.temperature &&
                  !formData.vitals?.bpSystolic &&
                  !formData.vitals?.spO2 && (
                    <p className="text-sm text-gray-500">No vitals recorded</p>
                  )}
              </div>

              {/* Lifestyle Summary */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Lifestyle</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {formData.lifestyle?.sleepHours !== undefined && (
                    <p className="text-gray-600">Sleep: {formData.lifestyle.sleepHours} hours</p>
                  )}
                  {formData.lifestyle?.stressLevel && (
                    <p className="text-gray-600">Stress: {formData.lifestyle.stressLevel}</p>
                  )}
                  {formData.lifestyle?.hydration && (
                    <p className="text-gray-600">Hydration: {formData.lifestyle.hydration}</p>
                  )}
                  {formData.lifestyle?.meals !== undefined && (
                    <p className="text-gray-600">Meals: {formData.lifestyle.meals}</p>
                  )}
                  {formData.lifestyle?.exercise !== undefined && (
                    <p className="text-gray-600">
                      Exercise: {formData.lifestyle.exercise ? "Yes" : "No"}
                    </p>
                  )}
                </div>
                {!formData.lifestyle?.sleepHours &&
                  !formData.lifestyle?.stressLevel &&
                  !formData.lifestyle?.hydration && (
                    <p className="text-sm text-gray-500">No lifestyle data recorded</p>
                  )}
              </div>
            </div>
          )}
          </CardContent>
        </Card>
      )}

      {/* Result Step - Show Risk Assessment */}
      {currentStep === "result" && riskAssessment && (
        <div className="space-y-6">
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">Health log submitted successfully!</p>
          </div>

          <RiskCard assessment={riskAssessment} showDetails={true} />
        </div>
      )}

      {/* Navigation Buttons */}
      {currentStep !== "result" ? (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            Back
          </Button>

          {currentStep !== "review" ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Health Log"}
            </Button>
          )}
        </div>
      ) : (
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
          <Button
            onClick={() => {
              setCurrentStep("symptoms");
              setFormData({ symptoms: { items: [], freeText: "" }, vitals: {}, lifestyle: {} });
              setRiskAssessment(null);
            }}
          >
            Log Another Entry
          </Button>
        </div>
      )}
    </div>
  );
}
