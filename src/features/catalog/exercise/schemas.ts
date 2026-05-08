import { z } from 'zod'

export const createExerciseSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  description: z.string().max(10000).optional(),
  category: z.enum(['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'CORE', 'MOBILITY', 'OTHER']),
  equipment: z.enum(['NO_EQUIPMENT', 'HOME', 'GYM']),
  youtubeUrl: z.string().url('URL no válida').optional().or(z.literal('')),
  visibility: z.enum(['PUBLIC', 'PRIVATE']),
})

export type CreateExerciseForm = z.infer<typeof createExerciseSchema>
