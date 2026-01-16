"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    color: "bg-green-100 text-green-800 border-green-200",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: "✓",
    label: "Low Risk",
  },
  MEDIUM: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    icon: "⚠",
    label: "Medium Risk",
  },
  HIGH: {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    icon: "⚠",
    label: "High Risk",
  },
  EMERGENCY: {
    color: "bg-red-100 text-red-800 border-red-200",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: "🚨",
    label: "Emergency",
  },
};

export function RiskCard({ assessment, showDetails = true }: RiskCardProps) {
  const config = riskLevelConfig[assessment.riskLevel];

  return (
    <Card className={`${config.borderColor} border-2`}>
      <CardHeader className={config.bgColor}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span>{config.icon}</span>
            Risk Assessment
          </CardTitle>
          <Badge className={config.color}>{config.label}</Badge>
        </div>
        <CardDescription className="text-gray-700">
          {assessment.consultAdvice}
        </CardDescription>
      </CardHeader>

      {showDetails && (
        <CardContent className="space-y-4 pt-4">
          {/* Red Flags - Most Important */}
          {assessment.redFlags.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-1">
                <span>🚩</span> Red Flags
              </h4>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {assessment.redFlags.map((flag, index) => (
                  <li key={index}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Reasons */}
          {assessment.reasons.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Assessment Reasons</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {assessment.reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          {assessment.nextSteps.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Recommended Next Steps</h4>
              <ul className="space-y-2">
                {assessment.nextSteps.map((step, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <span className="text-blue-500 mt-0.5">→</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Emergency Action for HIGH/EMERGENCY */}
          {(assessment.riskLevel === "HIGH" || assessment.riskLevel === "EMERGENCY") && (
            <div className={`p-4 rounded-lg ${assessment.riskLevel === "EMERGENCY" ? "bg-red-100" : "bg-orange-100"}`}>
              <p className={`text-sm font-medium ${assessment.riskLevel === "EMERGENCY" ? "text-red-800" : "text-orange-800"}`}>
                {assessment.riskLevel === "EMERGENCY"
                  ? "This is a medical emergency. Please call emergency services (911) or go to the nearest emergency room immediately."
                  : "Please seek medical attention today. Contact your doctor or visit an urgent care facility."}
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// Compact version for dashboard overview
export function RiskBadge({ riskLevel }: { riskLevel: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY" }) {
  const config = riskLevelConfig[riskLevel];
  return (
    <Badge className={config.color}>
      {config.icon} {config.label}
    </Badge>
  );
}
