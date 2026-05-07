import { z } from 'zod'

export const createPhysicalSessionSchema = z.object({
  sessionDate: z.string().min(1, 'Fecha requerida'),
  sessionType: z.enum(['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'HIIT', 'OTHER']),
  title: z.string().min(1, 'Título requerido').max(200),
  durationMinutes: z.number().int().positive().optional(),
  notes: z.string().max(5000).optional(),
  youtubeUrl: z.string().url('URL inválida').optional().or(z.literal('')),
})

export type CreatePhysicalSessionForm = z.infer<typeof createPhysicalSessionSchema>
