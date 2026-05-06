import { z } from 'zod'

export const createPositionSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(120),
  type: z.enum(['TOP', 'BOTTOM', 'NEUTRAL']),
  visibility: z.enum(['PUBLIC', 'PRIVATE']),
  description: z.string().max(10000).optional(),
})

export type CreatePositionForm = z.infer<typeof createPositionSchema>
