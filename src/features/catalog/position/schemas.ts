import { z } from 'zod'

export const createPositionSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(120),
  type: z.enum(['TOP', 'BOTTOM', 'STANDING', 'GROUND_NEUTRAL', 'SUBMITTED']),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
  description: z.string().max(10000).optional(),
  youtubeUrl: z.string().url('URL de YouTube no válida').optional().or(z.literal('')),
})

export type CreatePositionForm = z.infer<typeof createPositionSchema>
