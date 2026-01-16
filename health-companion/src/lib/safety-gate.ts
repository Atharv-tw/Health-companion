/**
 * Safety Gate - Local safety checks for chat input
 *
 * This module provides a safety layer that:
 * 1. Pre-checks user messages for emergency keywords
 * 2. Blocks unsafe requests (diagnosis, medication dosing)
 * 3. Acts as fallback when OnDemand AI is unreachable
 *
 * Returns: ALLOW | EMERGENCY_ESCALATE | BLOCK_UNSAFE
 */

export type SafetyResult = "ALLOW" | "EMERGENCY_ESCALATE" | "BLOCK_UNSAFE";

export interface SafetyCheckResult {
  result: SafetyResult;
  reason?: string;
  suggestedResponse?: string;
  shouldTriggerSOS?: boolean;
}

// Emergency keywords that require immediate escalation
const EMERGENCY_PATTERNS = [
  // Cardiac emergencies
  /chest\s*pain.*breath|breath.*chest\s*pain/i,
  /heart\s*attack/i,
  /can'?t\s*breathe/i,
  /difficulty\s*breathing/i,
  /severe\s*chest\s*pain/i,

  // Stroke symptoms
  /stroke/i,
  /face\s*drooping/i,
  /arm\s*weakness/i,
  /speech\s*difficulty/i,
  /sudden\s*numbness/i,
  /sudden\s*confusion/i,

  // Severe allergic reaction
  /anaphyla/i,
  /throat\s*closing/i,
  /throat\s*swelling/i,
  /can'?t\s*swallow/i,

  // Life-threatening situations
  /suicid/i,
  /kill\s*(my)?self/i,
  /want\s*to\s*die/i,
  /end\s*my\s*life/i,
  /overdos/i,
  /poison/i,
  /severe\s*bleeding/i,
  /unconscious/i,
  /seizure/i,
  /convulsion/i,

  // Severe pain indicators
  /worst\s*pain.*life/i,
  /excruciating/i,
];

// Patterns that should be blocked - diagnosis requests
const DIAGNOSIS_PATTERNS = [
  /what\s*(disease|illness|condition)\s*do\s*i\s*have/i,
  /diagnose\s*(me|my)/i,
  /tell\s*me\s*what('s)?\s*(wrong|i\s*have)/i,
  /do\s*i\s*have\s*(cancer|diabetes|hiv|aids|covid)/i,
  /is\s*(this|it)\s*(cancer|serious|fatal|deadly)/i,
  /am\s*i\s*dying/i,
  /what'?s\s*my\s*diagnosis/i,
];

// Patterns that should be blocked - medication dosing
const MEDICATION_PATTERNS = [
  /dosage\s*(of|for)/i,
  /how\s*much\s*(medicine|medication|drug|pill)/i,
  /how\s*many\s*(mg|milligram|pill|tablet)/i,
  /what\s*dose\s*(should|can)/i,
  /prescribe\s*(me|a)/i,
  /what\s*(antibiotic|medicine|medication|drug)\s*should\s*i\s*take/i,
  /give\s*me\s*(a\s*)?(prescription|medication|medicine)/i,
  /can\s*i\s*take\s*\d+\s*(mg|pill|tablet)/i,
  /increase.*dose/i,
  /double.*dose/i,
  /stop\s*(taking|my)\s*(medication|medicine)/i,
  /start\s*taking/i,
];

// Patterns for harmful requests
const HARMFUL_PATTERNS = [
  /how\s*to\s*(harm|hurt|injure)/i,
  /ways\s*to\s*die/i,
  /painless\s*death/i,
];

/**
 * Check if the user message requires emergency escalation
 */
function checkForEmergency(message: string): boolean {
  return EMERGENCY_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Check if the user is requesting a diagnosis
 */
function checkForDiagnosisRequest(message: string): boolean {
  return DIAGNOSIS_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Check if the user is requesting medication dosing advice
 */
function checkForMedicationRequest(message: string): boolean {
  return MEDICATION_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Check for harmful content
 */
function checkForHarmfulContent(message: string): boolean {
  return HARMFUL_PATTERNS.some(pattern => pattern.test(message));
}

/**
 * Main safety gate function - checks user input before AI processing
 */
export function checkSafety(userMessage: string): SafetyCheckResult {
  const message = userMessage.trim();

  // Check for empty message
  if (!message) {
    return {
      result: "BLOCK_UNSAFE",
      reason: "Empty message",
      suggestedResponse: "Please enter a message to continue.",
    };
  }

  // Priority 1: Check for emergencies - escalate immediately
  if (checkForEmergency(message)) {
    return {
      result: "EMERGENCY_ESCALATE",
      reason: "Emergency keywords detected",
      shouldTriggerSOS: true,
      suggestedResponse: `🚨 **This sounds like a medical emergency.**

**If you or someone else is in immediate danger, please:**
1. **Call emergency services (911) immediately**
2. Do not wait - every second counts
3. Stay on the line with emergency services
4. If possible, have someone meet the ambulance

**While waiting for help:**
- Stay calm and try to remain still
- If experiencing chest pain, sit or lie down
- If someone is unconscious, check their breathing
- Do not drive yourself to the hospital

Your safety is the top priority. Professional medical help is essential in emergencies.`,
    };
  }

  // Priority 2: Check for harmful content
  if (checkForHarmfulContent(message)) {
    return {
      result: "EMERGENCY_ESCALATE",
      reason: "Harmful content detected",
      shouldTriggerSOS: true,
      suggestedResponse: `I'm concerned about what you've shared. Your life matters, and help is available.

**Please reach out now:**
- **National Suicide Prevention Lifeline:** 988 (call or text)
- **Crisis Text Line:** Text HOME to 741741
- **International Association for Suicide Prevention:** https://www.iasp.info/resources/Crisis_Centres/

You don't have to face this alone. Professional support can make a difference.`,
    };
  }

  // Priority 3: Block diagnosis requests
  if (checkForDiagnosisRequest(message)) {
    return {
      result: "BLOCK_UNSAFE",
      reason: "Diagnosis request detected",
      suggestedResponse: `I understand you're looking for answers about your health, but I'm not able to provide medical diagnoses. Only qualified healthcare professionals can diagnose conditions after proper examination and testing.

**What I can help with:**
- Explaining general health information
- Helping you track your symptoms
- Suggesting when to seek medical care
- Providing guidance on healthy lifestyle choices

**Recommended next steps:**
- Schedule an appointment with your doctor
- If symptoms are severe or worsening, visit urgent care
- Use your health log to share symptom history with your doctor

Would you like help with any of these instead?`,
    };
  }

  // Priority 4: Block medication dosing requests
  if (checkForMedicationRequest(message)) {
    return {
      result: "BLOCK_UNSAFE",
      reason: "Medication dosing request detected",
      suggestedResponse: `I'm not able to provide advice on medication dosages, prescriptions, or whether to start/stop medications. This requires professional medical judgment based on your specific health situation.

**For medication questions, please:**
- Consult your doctor or prescribing physician
- Speak with a licensed pharmacist
- Call your healthcare provider's nurse line
- Check the medication's official prescribing information

**Important:** Never change your medication regimen without consulting a healthcare professional. Incorrect dosing can be dangerous.

Is there something else I can help you with, like tracking your symptoms or providing general health information?`,
    };
  }

  // Message passed all safety checks
  return {
    result: "ALLOW",
  };
}

/**
 * Get a fallback response when OnDemand AI is unavailable
 */
export function getFallbackResponse(userMessage: string): string {
  // First run safety check
  const safetyCheck = checkSafety(userMessage);

  if (safetyCheck.suggestedResponse) {
    return safetyCheck.suggestedResponse;
  }

  // Generic fallback for when AI is unavailable
  return `I'm currently unable to process your request due to a technical issue. Please try again in a moment.

**In the meantime, you can:**
- Log your symptoms using the Health Log feature
- Review your health history on the Dashboard
- Contact your healthcare provider if you have urgent concerns

If this is a medical emergency, please call emergency services (911) immediately.`;
}

/**
 * Check if a response from AI contains unsafe content
 * This is a post-processing safety check
 */
export function validateAIResponse(response: string): { safe: boolean; reason?: string } {
  // Check for definitive diagnosis statements
  const diagnosisIndicators = [
    /you\s*(definitely\s*)?have\s+(a\s+)?(cancer|diabetes|hiv|aids)/i,
    /your\s+diagnosis\s+is/i,
    /i\s+can\s+confirm\s+(you\s+have|that)/i,
    /this\s+is\s+(definitely|certainly)\s+(cancer|diabetes)/i,
  ];

  for (const pattern of diagnosisIndicators) {
    if (pattern.test(response)) {
      return {
        safe: false,
        reason: "Response contains definitive diagnosis",
      };
    }
  }

  // Check for specific dosage recommendations
  const dosageIndicators = [
    /take\s+\d+\s*(mg|milligrams?|tablets?|pills?)/i,
    /dosage\s*(is|should\s*be)\s*\d+/i,
    /\d+\s*(mg|ml)\s*(every|twice|three\s*times)/i,
  ];

  for (const pattern of dosageIndicators) {
    if (pattern.test(response)) {
      return {
        safe: false,
        reason: "Response contains specific dosage recommendation",
      };
    }
  }

  return { safe: true };
}
