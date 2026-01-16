"use client";

import { CeramicCard } from "@/components/ui/CeramicCard";
import { AlertCircle, ShieldAlert, CheckCircle2, ArrowRight, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RiskAssessmentData {
  id?: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
  reasons: string[];
  nextSteps: string[];
  redFlags: string[];
  consultAdvice: string;
}

interface RiskCardProps {
  assessment: RiskAssessmentData;
  showDetails?: boolean;
}

const riskLevelConfig = {
  LOW: {
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-100",
    icon: CheckCircle2,
    label: "Low Risk",
  },
  MEDIUM: {
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-100",
    icon: AlertCircle,
    label: "Medium Risk",
  },
  HIGH: {
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-100",
    icon: ShieldAlert,
    label: "High Risk",
  },
  EMERGENCY: {
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-100",
    icon: ShieldAlert,
    label: "Emergency",
  },
};

export function RiskCard({ assessment, showDetails = true }: RiskCardProps) {
  const config = riskLevelConfig[assessment.riskLevel];
  const Icon = config.icon;

  return (
    <CeramicCard tiltEffect={false} className={cn("p-0 overflow-hidden", config.borderColor, "border-2")}>
      <div className={cn("p-8 flex items-center justify-between", config.bgColor)}>
        <div className="flex items-center gap-4">
          <div className={cn("w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm", config.color)}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tighter">Clinical Risk Assessment</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Status: {config.label}</p>
          </div>
        </div>
        <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white shadow-sm border border-white", config.color)}>
          {assessment.riskLevel}
        </div>
      </div>

      <div className="p-8 space-y-8">
        <p className="text-gray-600 font-light italic leading-relaxed">
          "{assessment.consultAdvice}"
        </p>

        {showDetails && (
          <>
            {/* Red Flags */}
            {assessment.redFlags.length > 0 && (
              <div className="p-6 bg-red-50/50 border border-red-100 rounded-3xl space-y-4">
                <div className="flex items-center gap-2 text-red-600">
                  <Flag className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Immediate Red Flags</span>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {assessment.redFlags.map((flag, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm font-medium text-red-700 bg-white/50 p-3 rounded-xl border border-red-50">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Steps */}
            {assessment.nextSteps.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Protocol: Recommended Actions</h4>
                <div className="grid grid-cols-1 gap-3">
                  {assessment.nextSteps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl group hover:bg-white hover:border-primary/20 transition-all"
                    >
                      <span className="text-sm font-medium text-gray-700">{step}</span>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reasons */}
            {assessment.reasons.length > 0 && (
              <div className="pt-4 opacity-50">
                <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">Logic Determinants</h4>
                <div className="flex flex-wrap gap-2">
                  {assessment.reasons.map((reason, index) => (
                    <span key={index} className="text-[10px] bg-gray-100 px-2 py-1 rounded-md text-gray-500 font-medium">
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </CeramicCard>
  );
}

export function RiskBadge({ riskLevel }: { riskLevel: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY" }) {
  const config = riskLevelConfig[riskLevel];
  return (
    <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-white shadow-sm", config.borderColor, config.color)}>
      <span className="text-[10px] font-bold uppercase tracking-widest">{config.label}</span>
    </div>
  );
}