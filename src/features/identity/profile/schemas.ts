import { z } from 'zod'

export const createProfileSchema = z.object({
  username: z.string().min(1, 'El nombre de usuario es requerido').max(50),
  belt: z.enum(['WHITE', 'BLUE', 'PURPLE', 'BROWN', 'BLACK']),
  stripes: z.number().int().min(0).max(4),
})

export type CreateProfileForm = z.infer<typeof createProfileSchema>
