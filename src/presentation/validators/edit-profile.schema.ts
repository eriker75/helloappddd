import { GENDER_TYPES } from "@/src/definitions/constants/GENDER_TYPES";
import { z } from "zod";

export const editProfileSchema = z.object({
  alias: z.string().min(2, "El alias es requerido"),
  birthDate: z.string().min(4, "La fecha de nacimiento es requerida"),
  biography: z.string().max(250, "Máximo 250 caracteres"),
  gender: z.enum([GENDER_TYPES.MALE, GENDER_TYPES.FEMALE, GENDER_TYPES.OTHER]),
  genderInterests: z.array(z.string()).min(1, "Selecciona al menos un interés"),
  minAgePreference: z.number().min(18),
  maxAgePreference: z.number().max(98),
  mainPicture: z.string().optional(),
  secondaryImages: z.array(z.string()).optional(),
});

export type EditProfileForm = z.infer<typeof editProfileSchema>;
