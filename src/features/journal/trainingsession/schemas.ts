import { z } from 'zod'

export const createTrainingSessionSchema = z.object({
  sessionDate: z.string().min(1, 'La fecha es requerida'),
  durationMinutes: z.number().min(1).max(480),
  location: z.string().max(200).optional(),
  intensity: z.enum(['LIGHT', 'MODERATE', 'HARD', 'COMPETITION']),
  notesMarkdown: z.string().optional(),
})

export type CreateTrainingSessionForm = z.infer<typeof createTrainingSessionSchema>
