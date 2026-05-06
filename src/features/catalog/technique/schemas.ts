import { z } from 'zod'

export const createTechniqueSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(120),
  startPositionId: z.number({ error: 'La posición de inicio es requerida' }).positive(),
  endPositionId: z.number().positive().optional(),
  belt: z.enum(['WHITE', 'BLUE', 'PURPLE', 'BROWN', 'BLACK']),
  modality: z.enum(['GI', 'NOGI', 'BOTH']),
  visibility: z.enum(['PUBLIC', 'PRIVATE']),
  description: z.string().max(10000).optional(),
  youtubeUrl: z.string().url('URL no válida').optional().or(z.literal('')),
})

export type CreateTechniqueForm = z.infer<typeof createTechniqueSchema>
