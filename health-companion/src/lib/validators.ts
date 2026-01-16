import { z } from "zod";

// Symptom schema
export const symptomItemSchema = z.object({
  name: z.string().min(1, "Symptom name is required"),
  severity: z.enum(["mild", "moderate", "severe"]),
  duration: z.string().optional(), // e.g., "2 days", "few hours"
});

export const symptomsSchema = z.object({
  items: z.array(symptomItemSchema).default([]),
  freeText: z.string().optional(),
});

// Vitals schema
export const vitalsSchema = z.object({
  heartRate: z.number().min(30).max(250).optional(),
  temperature: z.number().min(35).max(43).optional(), // Celsius
  bpSystolic: z.number().min(70).max(250).optional(),
  bpDiastolic: z.number().min(40).max(150).optional(),
  spO2: z.number().min(70).max(100).optional(),
}).optional();

// Lifestyle schema
export const lifestyleSchema = z.object({
  sleepHours: z.number().min(0).max(24).optional(),
  stressLevel: z.enum(["low", "moderate", "high"]).optional(),
  hydration: z.enum(["poor", "adequate", "good"]).optional(),
  exercise: z.boolean().optional(),
  meals: z.number().min(0).max(10).optional(),
}).optional();

// Complete health log schema
export const healthLogSchema = z.object({
  symptoms: symptomsSchema,
  vitals: vitalsSchema,
  lifestyle: lifestyleSchema,
});

export type SymptomItem = z.infer<typeof symptomItemSchema>;
export type Symptoms = z.infer<typeof symptomsSchema>;
export type Vitals = z.infer<typeof vitalsSchema>;
export type Lifestyle = z.infer<typeof lifestyleSchema>;
export type HealthLogInput = z.infer<typeof healthLogSchema>;

// Common symptoms list for UI
export const COMMON_SYMPTOMS = [
  "Headache",
  "Fever",
  "Cough",
  "Sore throat",
  "Fatigue",
  "Body aches",
  "Nausea",
  "Vomiting",
  "Diarrhea",
  "Stomach pain",
  "Chest pain",
  "Shortness of breath",
  "Dizziness",
  "Runny nose",
  "Congestion",
  "Chills",
  "Loss of appetite",
  "Skin rash",
  "Joint pain",
  "Back pain",
] as const;
