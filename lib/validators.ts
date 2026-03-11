import { z } from "zod";

export const createRunnerSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(100),
  clubId: z.string().min(1, "Le club est requis"),
});

export const createSessionSchema = z.object({
  runnerId: z.string().min(1),
  distance: z
    .union([z.coerce.number().positive(), z.literal(""), z.null(), z.undefined()])
    .transform((value) => {
      if (value === "" || value == null) return null;
      return Number(value);
    }),
  targetsHit: z.coerce.number().int().min(0).max(5),
});