import { z } from 'zod'

export const createTechniqueSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(120),
  positionId: z.number().int().positive(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']),
  description: z.string().max(10000).optional(),
})

export type CreateTechniqueForm = z.infer<typeof createTechniqueSchema>
