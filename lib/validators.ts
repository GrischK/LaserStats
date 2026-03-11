import {z} from "zod";

export const createRunnerSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(100),
});

export const createSessionSchema = z.object({
  runnerId: z.string().min(1),
  distance: z
    .union([z.coerce.number().positive(), z.nan()])
    .optional()
    .transform((value) => (typeof value === "number" && !Number.isNaN(value) ? value : null)),
  targetsHit: z.coerce.number().int().min(0).max(5),
});