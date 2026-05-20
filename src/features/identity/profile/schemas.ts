import { z } from 'zod'

export const updateProfileSchema = z.object({
  firstName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
  displayName: z.string().min(1, 'El alias es requerido').max(120),
  currentBelt: z.string().min(1, 'El cinturón es requerido'),
  preferredModality: z.string().min(1, 'La modalidad es requerida'),
  academy: z.string().max(200).optional(),
  beltSince: z.string().optional(),
  ageCategory: z.string().nullable().optional(),
  stripes: z.number().int().min(0).max(4).nullable().optional(),
  weight: z.number().min(30).max(180).nullable().optional(),
})

export type UpdateProfileForm = z.infer<typeof updateProfileSchema>
