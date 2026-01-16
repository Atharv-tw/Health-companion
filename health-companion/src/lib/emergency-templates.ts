/**
 * Emergency Response Templates
 *
 * Pre-defined response templates for emergency situations
 * and safety-blocked requests.
 */

export const EMERGENCY_RESPONSES = {
  // Generic medical emergency
  MEDICAL_EMERGENCY: `🚨 **This sounds like a medical emergency.**

**Take immediate action:**
1. **Call 911** (or your local emergency number) immediately
2. Stay calm and follow the dispatcher's instructions
3. Do not attempt to drive yourself
4. If possible, unlock your door for first responders

**While waiting for help:**
- Stay as still and calm as possible
- Loosen any tight clothing
- If you have prescribed emergency medication (like nitroglycerin or an EpiPen), use it as directed

Your safety is the priority. Professional medical help is on the way.`,

  // Cardiac emergency (chest pain + breathing difficulty)
  CARDIAC_EMERGENCY: `🚨 **Possible Cardiac Emergency Detected**

**Call 911 immediately** - Chest pain with breathing difficulty can indicate a heart attack.

**While waiting for help:**
1. Sit or lie down in a comfortable position
2. If you have aspirin and are not allergic, chew one regular aspirin (325mg)
3. Loosen any tight clothing
4. Try to stay calm and take slow breaths
5. If you have nitroglycerin prescribed, take it as directed

**Do NOT:**
- Drive yourself to the hospital
- Ignore symptoms hoping they'll pass
- Eat or drink anything

**Every minute matters with heart attacks. Call for help now.**`,

  // Stroke warning
  STROKE_WARNING: `🚨 **Possible Stroke Warning - Act FAST**

Use the **FAST** method to check:
- **F**ace: Is one side drooping? Ask them to smile.
- **A**rms: Can they raise both arms? Does one drift down?
- **S**peech: Is speech slurred or strange?
- **T**ime: Call 911 immediately if you see any of these signs!

**Call 911 now** - Stroke treatment is most effective within the first hours.

**While waiting:**
- Note the time symptoms started
- Keep the person lying down with head slightly elevated
- Do not give food, water, or medication
- Stay with them and keep them calm`,

  // Severe allergic reaction
  ALLERGIC_EMERGENCY: `🚨 **Severe Allergic Reaction (Anaphylaxis) Alert**

**Call 911 immediately**

**If you have an EpiPen:**
1. Use it immediately on outer thigh (through clothing is OK)
2. Hold for 10 seconds
3. Call 911 even after using EpiPen

**While waiting for help:**
- Lie down with legs elevated (unless having breathing difficulty)
- If breathing is difficult, sit up
- Remove any known allergen source
- Stay calm and still

**Symptoms can return** - You need professional monitoring even if you feel better.`,

  // Mental health crisis
  MENTAL_HEALTH_CRISIS: `I hear that you're going through an incredibly difficult time, and I want you to know that help is available right now.

**Please reach out immediately:**

📞 **National Suicide Prevention Lifeline:** 988 (call or text, 24/7)
📱 **Crisis Text Line:** Text HOME to 741741
🌐 **International Association for Suicide Prevention:** https://www.iasp.info/resources/Crisis_Centres/

**You are not alone.** These feelings can be overwhelming, but trained counselors are available 24/7 to listen and help.

If you're in immediate danger, please call 911 or go to your nearest emergency room.

**Your life has value. Please reach out for support.**`,

  // Breathing emergency
  BREATHING_EMERGENCY: `🚨 **Breathing Emergency**

**Call 911 immediately** for difficulty breathing.

**While waiting for help:**
1. Sit upright - don't lie flat
2. Stay calm and try to take slow breaths
3. Loosen any tight clothing around neck and chest
4. If you have an inhaler or prescribed breathing medication, use it
5. Open windows for fresh air if possible

**If someone else is having trouble breathing:**
- Keep them sitting upright
- Don't leave them alone
- Be ready to start CPR if they become unresponsive

**Do not wait** - breathing problems can worsen quickly.`,
};

export const BLOCKED_RESPONSES = {
  // Diagnosis request
  DIAGNOSIS_REQUEST: `I understand you're looking for answers about your health, but I'm not able to provide medical diagnoses.

**Why I can't diagnose:**
- Accurate diagnosis requires physical examination
- Lab tests and imaging may be needed
- Medical history review is essential
- Only licensed healthcare providers can diagnose

**What I can help with:**
✓ Explaining general health information
✓ Helping you track and describe your symptoms
✓ Suggesting when to seek medical care
✓ Providing wellness and prevention tips

**Your next step:** Schedule an appointment with your healthcare provider to discuss your concerns. Your logged symptoms can help them understand your situation better.`,

  // Medication request
  MEDICATION_REQUEST: `I'm not able to provide medication recommendations or dosing advice.

**Why this matters:**
- Medications interact with other drugs and conditions
- Dosing depends on your specific health profile
- Wrong medications or doses can be harmful
- Only licensed providers can prescribe safely

**For medication questions, contact:**
- Your prescribing doctor
- A licensed pharmacist
- Your healthcare provider's nurse line

**Important safety reminder:**
Never start, stop, or change medication doses without professional guidance.

**How I can help instead:**
Would you like to log your symptoms or discuss general health information?`,

  // General unsafe request
  GENERAL_UNSAFE: `I'm not able to help with that specific request as it falls outside my safety guidelines.

**I'm designed to:**
✓ Provide general health information
✓ Help track symptoms and wellness
✓ Offer lifestyle and prevention guidance
✓ Direct you to appropriate care

**I cannot:**
✗ Diagnose conditions
✗ Prescribe or dose medications
✗ Replace professional medical advice

Is there something else I can help you with today?`,
};

export const FALLBACK_RESPONSES = {
  // Service unavailable
  SERVICE_UNAVAILABLE: `I'm temporarily unable to process your request. This might be due to a technical issue.

**Please try:**
1. Waiting a moment and sending your message again
2. Refreshing the page if the problem persists

**In the meantime, you can:**
- Log your symptoms using the Health Log feature
- Review your health history on the Dashboard

If you have urgent health concerns, please contact your healthcare provider or call 911 for emergencies.`,

  // Generic helpful response
  GENERIC_HEALTH: `Thank you for sharing. While I process health-related questions, remember:

**For any health concern:**
- Track your symptoms using the Health Log
- Note when symptoms started and any patterns
- Contact your healthcare provider for persistent issues

**For emergencies:**
Call 911 or go to the nearest emergency room immediately.

Is there a specific aspect of your health I can help you track or learn about?`,
};

/**
 * Get the appropriate emergency response based on detected keywords
 */
export function getEmergencyResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Check for cardiac-specific emergency
  if (
    (lowerMessage.includes("chest") && lowerMessage.includes("pain")) ||
    lowerMessage.includes("heart attack")
  ) {
    return EMERGENCY_RESPONSES.CARDIAC_EMERGENCY;
  }

  // Check for stroke
  if (
    lowerMessage.includes("stroke") ||
    lowerMessage.includes("face droop") ||
    lowerMessage.includes("arm weak") ||
    lowerMessage.includes("sudden numbness")
  ) {
    return EMERGENCY_RESPONSES.STROKE_WARNING;
  }

  // Check for allergic reaction
  if (
    lowerMessage.includes("anaphyl") ||
    lowerMessage.includes("throat closing") ||
    lowerMessage.includes("throat swelling")
  ) {
    return EMERGENCY_RESPONSES.ALLERGIC_EMERGENCY;
  }

  // Check for breathing emergency
  if (
    lowerMessage.includes("can't breathe") ||
    lowerMessage.includes("cannot breathe") ||
    lowerMessage.includes("difficulty breathing")
  ) {
    return EMERGENCY_RESPONSES.BREATHING_EMERGENCY;
  }

  // Check for mental health crisis
  if (
    lowerMessage.includes("suicid") ||
    lowerMessage.includes("kill myself") ||
    lowerMessage.includes("want to die") ||
    lowerMessage.includes("end my life")
  ) {
    return EMERGENCY_RESPONSES.MENTAL_HEALTH_CRISIS;
  }

  // Default medical emergency
  return EMERGENCY_RESPONSES.MEDICAL_EMERGENCY;
}
