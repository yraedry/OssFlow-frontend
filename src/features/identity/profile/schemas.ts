import { z } from 'zod'

export const updateProfileSchema = z.object({
  firstName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
  displayName: z.string().min(1, 'El alias es requerido').max(120),
  currentBelt: z.string().min(1, 'El cinturón es requerido'),
  preferredModality: z.string().min(1, 'La modalidad es requerida'),
  academy: z.string().max(200).optional(),
  beltSince: z.string().optional(),
})

export type UpdateProfileForm = z.infer<typeof updateProfileSchema>
