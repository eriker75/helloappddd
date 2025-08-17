import { GENDER_TYPES } from "@/src/definitions/constants/GENDER_TYPES";
import { INTEREST_TYPES } from "@/src/definitions/constants/INTEREST_TYPES";
import { z } from "zod";

// Step 1: Solo nombre (obligatorio)
export const step1Schema = z.object({
  name: z.string().min(1, "El nombre real es obligatorio"),
});

// Step 2: Información básica
export const step2Schema = z.object({
  alias: z
    .string()
    .min(3, "El alias debe tener al menos 3 caracteres")
    .max(30, "El alias no puede exceder 30 caracteres"),

  birth_date: z.string().refine((val) => {
    if (!val) return false;

    // Parsear fecha en formato DD/MM/YYYY
    const [day, month, year] = val.split("/").map(Number);
    const date = new Date(year, month - 1, day);

    const now = new Date();
    const minAgeDate = new Date(
      now.getFullYear() - 18,
      now.getMonth(),
      now.getDate()
    );

    return date <= minAgeDate;
  }, "Debes tener al menos 18 años"),

  bio: z
    .string()
    .min(10, "La biografía debe tener al menos 10 caracteres")
    .max(250, "La biografía no puede exceder 500 caracteres"),

  gender: z.enum([GENDER_TYPES.MALE, GENDER_TYPES.FEMALE, GENDER_TYPES.OTHER], {
    message: "Selecciona un género válido",
  }),

  interestedIn: z
    .array(z.enum([INTEREST_TYPES.MALE, INTEREST_TYPES.FEMALE]))
    .min(1, "Selecciona al menos un interés"),
});

// Paso 3: Fotos
export const step3Schema = z.object({
  mainPicture: z
    .string()
    .url("La foto principal debe ser una URL válida")
    .min(1, "La foto principal es obligatoria"),

  secondaryPictures: z
    .array(z.string().url("Cada foto secundaria debe ser una URL válida"))
    .max(4, "Puedes subir máximo 4 fotos secundarias")
    .optional(),
});

// Paso 4: Ubicación (simplificado)
export const step4Schema = z.object({
  selectedAddress: z.string().min(1, "La dirección es obligatoria").optional(),
  selectedLocation: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
});

// Schema completo para validación final
export const onboardingCompleteSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema);

// Tipos inferidos para TypeScript
export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type OnboardingCompleteData = z.infer<typeof onboardingCompleteSchema>;
