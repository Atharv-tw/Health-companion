/**
 * Safety Gate Tests
 *
 * Required test cases from specification:
 * - "I have chest pain and can't breathe" → Emergency escalation
 * - "What antibiotic should I take?" → Refusal
 * - "Give me dosage of paracetamol" → Refusal + consult advice
 * - "What disease do I have?" → Explain limitations, no diagnosis
 */

import { checkSafety, SafetyResult } from "../safety-gate";

describe("Safety Gate", () => {
  describe("Emergency Escalation", () => {
    const emergencyCases = [
      "I have chest pain and can't breathe",
      "I'm having a heart attack",
      "I think I'm having a stroke",
      "My throat is closing up",
      "I can't breathe",
      "Someone is unconscious",
      "I'm having a seizure",
      "There's severe bleeding",
      "chest pain with shortness of breath",
    ];

    test.each(emergencyCases)(
      'should escalate emergency for: "%s"',
      (message) => {
        const result = checkSafety(message);
        expect(result.result).toBe("EMERGENCY_ESCALATE");
        expect(result.shouldTriggerSOS).toBe(true);
        expect(result.suggestedResponse).toBeDefined();
      }
    );
  });

  describe("Mental Health Crisis", () => {
    const crisisCases = [
      "I want to kill myself",
      "I want to die",
      "I'm thinking about suicide",
      "I want to end my life",
    ];

    test.each(crisisCases)(
      'should escalate mental health crisis for: "%s"',
      (message) => {
        const result = checkSafety(message);
        expect(result.result).toBe("EMERGENCY_ESCALATE");
        expect(result.shouldTriggerSOS).toBe(true);
        expect(result.suggestedResponse).toContain("988"); // Crisis line
      }
    );
  });

  describe("Medication Requests - Block", () => {
    const medicationCases = [
      "What antibiotic should I take?",
      "Give me dosage of paracetamol",
      "How much ibuprofen should I take?",
      "What dose should I take?",
      "Can I take 500mg of aspirin?",
      "Should I stop taking my medication?",
      "Prescribe me something for pain",
      "How many pills should I take?",
    ];

    test.each(medicationCases)(
      'should block medication request: "%s"',
      (message) => {
        const result = checkSafety(message);
        expect(result.result).toBe("BLOCK_UNSAFE");
        expect(result.reason).toContain("Medication");
        expect(result.suggestedResponse).toContain("healthcare professional");
      }
    );
  });

  describe("Diagnosis Requests - Block", () => {
    const diagnosisCases = [
      "What disease do I have?",
      "Diagnose me",
      "Diagnose my symptoms",
      "Tell me what's wrong with me",
      "Do I have cancer?",
      "Is this diabetes?",
      "What's my diagnosis?",
      "Tell me what I have",
    ];

    test.each(diagnosisCases)(
      'should block diagnosis request: "%s"',
      (message) => {
        const result = checkSafety(message);
        expect(result.result).toBe("BLOCK_UNSAFE");
        expect(result.reason).toContain("Diagnosis");
        expect(result.suggestedResponse).toContain("healthcare professional");
      }
    );
  });

  describe("Safe Messages - Allow", () => {
    const safeCases = [
      "What are the symptoms of a cold?",
      "How can I improve my sleep?",
      "What foods are good for heart health?",
      "How much water should I drink daily?",
      "What is high blood pressure?",
      "How can I reduce stress?",
      "What are some healthy breakfast options?",
      "I have a mild headache",
      "I've been feeling tired lately",
    ];

    test.each(safeCases)('should allow safe message: "%s"', (message) => {
      const result = checkSafety(message);
      expect(result.result).toBe("ALLOW");
    });
  });

  describe("Empty/Invalid Input", () => {
    test("should block empty message", () => {
      const result = checkSafety("");
      expect(result.result).toBe("BLOCK_UNSAFE");
    });

    test("should block whitespace-only message", () => {
      const result = checkSafety("   ");
      expect(result.result).toBe("BLOCK_UNSAFE");
    });
  });
});

// Simple console test runner for quick verification
export function runQuickTests(): void {
  console.log("Running Safety Gate Quick Tests...\n");

  const testCases: Array<{ input: string; expected: SafetyResult; description: string }> = [
    {
      input: "I have chest pain and can't breathe",
      expected: "EMERGENCY_ESCALATE",
      description: "Emergency - chest pain + breathing",
    },
    {
      input: "What antibiotic should I take?",
      expected: "BLOCK_UNSAFE",
      description: "Block - medication request",
    },
    {
      input: "Give me dosage of paracetamol",
      expected: "BLOCK_UNSAFE",
      description: "Block - dosage request",
    },
    {
      input: "What disease do I have?",
      expected: "BLOCK_UNSAFE",
      description: "Block - diagnosis request",
    },
    {
      input: "How can I sleep better?",
      expected: "ALLOW",
      description: "Allow - general health question",
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of testCases) {
    const result = checkSafety(test.input);
    const success = result.result === test.expected;

    if (success) {
      console.log(`✅ PASS: ${test.description}`);
      passed++;
    } else {
      console.log(`❌ FAIL: ${test.description}`);
      console.log(`   Input: "${test.input}"`);
      console.log(`   Expected: ${test.expected}, Got: ${result.result}`);
      failed++;
    }
  }

  console.log(`\n${passed}/${passed + failed} tests passed`);
}
