import { z } from 'zod'

export const createCompetitionLogSchema = z.object({
  eventName:        z.string().min(1, 'El nombre del evento es requerido').max(255),
  eventDate:        z.string().min(1, 'Fecha requerida'),
  weightCategory:   z.string().max(50).optional(),
  categoryAge:      z.string().max(20).optional(),
  location:         z.string().max(255).optional(),
  giNogi:           z.string().max(10).optional(),
  totalMatches:     z.number().int().min(0).optional(),
  result:           z.string().max(50).optional(),
  analysisMarkdown: z.string().max(50000).optional(),
})

export type CreateCompetitionLogForm = z.infer<typeof createCompetitionLogSchema>
