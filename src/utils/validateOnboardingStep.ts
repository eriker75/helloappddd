import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
} from "../presentation/validators/onboardin.shemas";

/**
 * Validates onboarding data for a given step using the appropriate schema.
 * @param step The onboarding step number (1-4)
 * @param data The data object to validate for the step
 * @returns Promise<boolean> - true if valid, false otherwise
 */
export async function validateOnboardingStep(
  step: number,
  data: any
): Promise<boolean> {
  try {
    switch (step) {
      case 1:
        await step1Schema.parseAsync(data);
        return true;
      case 2:
        await step2Schema.parseAsync(data);
        return true;
      case 3:
        await step3Schema.parseAsync(data);
        return true;
      case 4:
        await step4Schema.parseAsync(data);
        return true;
      default:
        return false;
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.log("Onboarding step validation error:", error);
    }
    return false;
  }
}
