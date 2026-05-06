import { z } from 'zod'

export const updateProfileSchema = z.object({
  displayName: z.string().min(1, 'Nombre requerido').max(100),
  avatarUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  bio: z.string().max(500).optional(),
})

export type UpdateProfileForm = z.infer<typeof updateProfileSchema>
