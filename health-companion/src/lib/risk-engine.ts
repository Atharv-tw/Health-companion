import { HealthLogInput, SymptomItem } from "./validators";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";

export interface RiskAssessment {
  riskLevel: RiskLevel;
  reasons: string[];
  nextSteps: string[];
  redFlags: string[];
  consultAdvice: string;
  ruleVersion: string;
}

interface UserProfile {
  age?: number;
  conditions?: string[];
  allergies?: string[];
}

const RULE_VERSION = "1.0.0";

// Emergency symptoms that require immediate attention
const EMERGENCY_SYMPTOMS = [
  "chest pain",
  "shortness of breath",
  "difficulty breathing",
  "severe allergic reaction",
  "loss of consciousness",
  "severe bleeding",
  "stroke symptoms",
  "seizure",
];

// High-risk symptoms
const HIGH_RISK_SYMPTOMS = [
  "chest pain",
  "shortness of breath",
  "high fever",
  "severe headache",
  "confusion",
  "fainting",
  "severe abdominal pain",
  "blood in stool",
  "blood in urine",
  "sudden vision changes",
  "severe dizziness",
  "numbness",
  "weakness on one side",
];

// Medium-risk symptoms
const MEDIUM_RISK_SYMPTOMS = [
  "fever",
  "persistent cough",
  "vomiting",
  "diarrhea",
  "headache",
  "body aches",
  "fatigue",
  "nausea",
  "dizziness",
  "joint pain",
  "back pain",
];

export function assessRisk(
  healthLog: HealthLogInput,
  userProfile?: UserProfile
): RiskAssessment {
  const reasons: string[] = [];
  const nextSteps: string[] = [];
  const redFlags: string[] = [];
  let riskLevel: RiskLevel = "LOW";

  const symptoms = healthLog.symptoms.items;
  const vitals = healthLog.vitals || {};
  const lifestyle = healthLog.lifestyle || {};

  // ===== SYMPTOM ANALYSIS =====

  // Check for emergency symptoms
  const emergencyMatches = checkSymptomMatches(symptoms, EMERGENCY_SYMPTOMS);
  if (emergencyMatches.length > 0) {
    riskLevel = "EMERGENCY";
    redFlags.push(...emergencyMatches.map(s => `${s} requires immediate medical attention`));
    reasons.push(`Emergency symptoms detected: ${emergencyMatches.join(", ")}`);
  }

  // Check for high-risk symptoms
  const highRiskMatches = checkSymptomMatches(symptoms, HIGH_RISK_SYMPTOMS);
  if (highRiskMatches.length > 0 && riskLevel !== "EMERGENCY") {
    riskLevel = "HIGH";
    reasons.push(`High-risk symptoms: ${highRiskMatches.join(", ")}`);
  }

  // Check for severe symptoms
  const severeSymptoms = symptoms.filter(s => s.severity === "severe");
  if (severeSymptoms.length > 0) {
    if (riskLevel === "LOW") riskLevel = "MEDIUM";
    if (severeSymptoms.length >= 2 && riskLevel === "MEDIUM") riskLevel = "HIGH";
    reasons.push(`${severeSymptoms.length} severe symptom(s): ${severeSymptoms.map(s => s.name).join(", ")}`);
  }

  // Check for medium-risk symptoms
  const mediumRiskMatches = checkSymptomMatches(symptoms, MEDIUM_RISK_SYMPTOMS);
  if (mediumRiskMatches.length > 0 && riskLevel === "LOW") {
    riskLevel = "MEDIUM";
    reasons.push(`Symptoms requiring attention: ${mediumRiskMatches.join(", ")}`);
  }

  // Check for prolonged symptoms (more than a week)
  const prolongedSymptoms = symptoms.filter(s => s.duration === "more than a week");
  if (prolongedSymptoms.length > 0) {
    if (riskLevel === "LOW") riskLevel = "MEDIUM";
    reasons.push(`Prolonged symptoms (>1 week): ${prolongedSymptoms.map(s => s.name).join(", ")}`);
    nextSteps.push("Consider consulting a doctor for symptoms lasting more than a week");
  }

  // ===== VITAL SIGNS ANALYSIS =====

  // Temperature check
  if (vitals.temperature) {
    if (vitals.temperature >= 40) {
      if (riskLevel !== "EMERGENCY") riskLevel = "HIGH";
      redFlags.push("Very high fever (≥40°C)");
      reasons.push(`High fever: ${vitals.temperature}°C`);
    } else if (vitals.temperature >= 38.5) {
      if (riskLevel === "LOW") riskLevel = "MEDIUM";
      reasons.push(`Elevated temperature: ${vitals.temperature}°C`);
    } else if (vitals.temperature >= 37.5) {
      reasons.push(`Mild fever: ${vitals.temperature}°C`);
    }
  }

  // Heart rate check
  if (vitals.heartRate) {
    if (vitals.heartRate > 120 || vitals.heartRate < 50) {
      if (riskLevel === "LOW") riskLevel = "MEDIUM";
      if (vitals.heartRate > 150 || vitals.heartRate < 40) {
        riskLevel = "HIGH";
        redFlags.push(`Abnormal heart rate: ${vitals.heartRate} bpm`);
      }
      reasons.push(`Heart rate outside normal range: ${vitals.heartRate} bpm`);
    }
  }

  // Blood pressure check
  if (vitals.bpSystolic && vitals.bpDiastolic) {
    if (vitals.bpSystolic >= 180 || vitals.bpDiastolic >= 120) {
      riskLevel = "HIGH";
      redFlags.push("Hypertensive crisis - seek immediate care");
      reasons.push(`Very high blood pressure: ${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg`);
    } else if (vitals.bpSystolic >= 140 || vitals.bpDiastolic >= 90) {
      if (riskLevel === "LOW") riskLevel = "MEDIUM";
      reasons.push(`Elevated blood pressure: ${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg`);
    } else if (vitals.bpSystolic < 90 || vitals.bpDiastolic < 60) {
      if (riskLevel === "LOW") riskLevel = "MEDIUM";
      reasons.push(`Low blood pressure: ${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg`);
    }
  }

  // SpO2 check
  if (vitals.spO2) {
    if (vitals.spO2 < 90) {
      riskLevel = "EMERGENCY";
      redFlags.push("Critically low oxygen saturation - seek emergency care immediately");
      reasons.push(`Very low oxygen: ${vitals.spO2}%`);
    } else if (vitals.spO2 < 94) {
      if (riskLevel !== "EMERGENCY") riskLevel = "HIGH";
      redFlags.push("Low oxygen saturation");
      reasons.push(`Low oxygen saturation: ${vitals.spO2}%`);
    }
  }

  // ===== LIFESTYLE FACTORS =====

  if (lifestyle.sleepHours !== undefined && lifestyle.sleepHours < 4) {
    reasons.push("Severe sleep deprivation may affect health");
    nextSteps.push("Try to get at least 7-8 hours of sleep");
  }

  if (lifestyle.stressLevel === "high") {
    reasons.push("High stress levels reported");
    nextSteps.push("Consider stress management techniques");
  }

  if (lifestyle.hydration === "poor") {
    reasons.push("Poor hydration reported");
    nextSteps.push("Increase water intake to at least 8 glasses per day");
  }

  // ===== COMORBIDITY CHECK =====

  if (userProfile?.conditions && userProfile.conditions.length > 0) {
    const hasChronicCondition = userProfile.conditions.some(c =>
      ["diabetes", "heart disease", "hypertension", "asthma", "copd"].includes(c.toLowerCase())
    );
    if (hasChronicCondition && symptoms.length > 0) {
      if (riskLevel === "LOW") riskLevel = "MEDIUM";
      reasons.push("Pre-existing conditions may require closer monitoring");
      nextSteps.push("Consider consulting your regular healthcare provider");
    }
  }

  // Age-based adjustments
  if (userProfile?.age) {
    if ((userProfile.age > 65 || userProfile.age < 5) && symptoms.length > 0) {
      if (riskLevel === "LOW") riskLevel = "MEDIUM";
      reasons.push("Age group may require closer monitoring");
    }
  }

  // ===== COMBINATION CHECKS =====

  // Chest pain + shortness of breath = potential cardiac emergency
  const hasChestPain = symptoms.some(s => s.name.toLowerCase().includes("chest pain"));
  const hasBreathingIssue = symptoms.some(s =>
    s.name.toLowerCase().includes("shortness of breath") ||
    s.name.toLowerCase().includes("difficulty breathing")
  );
  if (hasChestPain && hasBreathingIssue) {
    riskLevel = "EMERGENCY";
    redFlags.push("Chest pain with breathing difficulty - possible cardiac emergency");
  }

  // Fever + severe headache + stiff neck = potential meningitis
  const hasFever = symptoms.some(s => s.name.toLowerCase().includes("fever")) || (vitals.temperature && vitals.temperature >= 38);
  const hasSevereHeadache = symptoms.some(s => s.name.toLowerCase().includes("headache") && s.severity === "severe");
  if (hasFever && hasSevereHeadache) {
    if (riskLevel !== "EMERGENCY") riskLevel = "HIGH";
    redFlags.push("Fever with severe headache - seek medical evaluation");
  }

  // ===== GENERATE NEXT STEPS =====

  if (riskLevel === "EMERGENCY") {
    nextSteps.unshift("Call emergency services (911) or go to the nearest emergency room immediately");
    nextSteps.push("Do not drive yourself - have someone take you or call an ambulance");
  } else if (riskLevel === "HIGH") {
    nextSteps.unshift("Seek medical attention today");
    nextSteps.push("Contact your doctor or visit an urgent care clinic");
    nextSteps.push("Monitor symptoms closely and go to ER if they worsen");
  } else if (riskLevel === "MEDIUM") {
    nextSteps.push("Monitor your symptoms over the next 24-48 hours");
    nextSteps.push("Schedule a doctor's appointment if symptoms persist or worsen");
    nextSteps.push("Rest and stay hydrated");
  } else {
    nextSteps.push("Continue monitoring your health");
    nextSteps.push("Maintain healthy habits: sleep, hydration, nutrition");
    nextSteps.push("Log your health regularly to track patterns");
  }

  // ===== GENERATE CONSULT ADVICE =====

  let consultAdvice: string;
  switch (riskLevel) {
    case "EMERGENCY":
      consultAdvice = "This is a medical emergency. Please seek immediate professional medical care. Call emergency services or go to the nearest emergency room.";
      break;
    case "HIGH":
      consultAdvice = "Your symptoms suggest you should see a healthcare provider today. Please contact your doctor or visit an urgent care facility.";
      break;
    case "MEDIUM":
      consultAdvice = "While not immediately urgent, your symptoms warrant attention. Consider scheduling an appointment with your healthcare provider if symptoms persist beyond 48 hours.";
      break;
    default:
      consultAdvice = "Your current health indicators are within normal ranges. Continue to monitor your health and maintain healthy lifestyle habits.";
  }

  // If no specific reasons were found
  if (reasons.length === 0) {
    reasons.push("No significant health concerns detected");
  }

  return {
    riskLevel,
    reasons,
    nextSteps,
    redFlags,
    consultAdvice,
    ruleVersion: RULE_VERSION,
  };
}

function checkSymptomMatches(symptoms: SymptomItem[], targetList: string[]): string[] {
  const matches: string[] = [];
  for (const symptom of symptoms) {
    const symptomLower = symptom.name.toLowerCase();
    for (const target of targetList) {
      if (symptomLower.includes(target.toLowerCase()) || target.toLowerCase().includes(symptomLower)) {
        matches.push(symptom.name);
        break;
      }
    }
  }
  return matches;
}
