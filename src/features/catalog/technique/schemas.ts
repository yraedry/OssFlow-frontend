import { z } from 'zod'

export const createTechniqueSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(120),
  category: z.enum(['SUBMISSION', 'SWEEP', 'PASS', 'TAKEDOWN', 'ESCAPE', 'TRANSITION']),
  startPositionId: z.number({ error: 'La posición de inicio es requerida' }).positive(),
  endPositionId: z.number().positive().optional(),
  minimumBelt: z.enum(['WHITE', 'BLUE', 'PURPLE', 'BROWN', 'BLACK']),
  modality: z.enum(['GI', 'NOGI', 'BOTH']),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
  description: z.string().max(10000).optional(),
  youtubeUrl: z.string().url('URL no válida').optional().or(z.literal('')),
})

export type CreateTechniqueForm = z.infer<typeof createTechniqueSchema>
