/**
 * Emergency Context Types
 *
 * Defines types for emergency detection and auto-escalation flow.
 */

export type EmergencyType =
  | 'CARDIAC'
  | 'STROKE'
  | 'BREATHING'
  | 'ALLERGIC'
  | 'MENTAL_HEALTH'
  | 'GENERAL';

export type EmergencySeverity = 'CRITICAL' | 'URGENT';

export interface EmergencyContext {
  type: EmergencyType;
  detectedKeywords: string[];
  severity: EmergencySeverity;
  timestamp: string;
  originalMessage: string;
}

/**
 * Maps emergency keywords to their emergency type
 */
export const EMERGENCY_TYPE_KEYWORDS: Record<EmergencyType, string[]> = {
  CARDIAC: [
    'chest pain', 'heart attack', 'cardiac', 'heart',
    'crushing pressure', 'radiating pain', 'arm pain'
  ],
  STROKE: [
    'stroke', 'face drooping', 'arm weakness', 'speech difficulty',
    'sudden numbness', 'sudden confusion', 'slurred speech'
  ],
  BREATHING: [
    'can\'t breathe', 'difficulty breathing', 'shortness of breath',
    'gasping', 'choking', 'airway'
  ],
  ALLERGIC: [
    'anaphylaxis', 'throat closing', 'throat swelling', 'can\'t swallow',
    'allergic reaction', 'severe allergy', 'epipen'
  ],
  MENTAL_HEALTH: [
    'suicide', 'suicidal', 'kill myself', 'want to die', 'end my life',
    'self-harm', 'overdose', 'cutting'
  ],
  GENERAL: [
    'emergency', 'unconscious', 'seizure', 'convulsion',
    'severe bleeding', 'poison', 'worst pain'
  ]
};
