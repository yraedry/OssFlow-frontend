import { z } from 'zod'

export const updateProfileSchema = z.object({
  displayName: z.string().min(1, 'Nombre requerido').max(120),
  currentBelt: z.string().min(1, 'El cinturón es requerido'),
  preferredModality: z.string().min(1, 'La modalidad es requerida'),
  academy: z.string().max(200).optional(),
})

export type UpdateProfileForm = z.infer<typeof updateProfileSchema>
