import { z } from 'zod'

export const createCompetitionLogSchema = z.object({
  eventName: z.string().min(1, 'El nombre del evento es requerido').max(255),
  eventDate: z.string().min(1, 'Fecha requerida'),
  weightCategory: z.string().max(50).optional(),
  totalMatches: z.number().int().min(0).optional(),
  result: z.string().max(50).optional(),
  analysisMarkdown: z.string().max(50000).optional(),
})

export type CreateCompetitionLogForm = z.infer<typeof createCompetitionLogSchema>

export const createMatchSchema = z.object({
  opponentName: z.string().min(1).max(200),
  opponentBelt: z.string().max(50).optional(),
  result: z.enum(['WIN', 'LOSS', 'DRAW']),
  technique: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
  duration: z.number().int().min(0).optional(),
  orderIndex: z.number().int().min(0).default(0),
})

export type CreateMatchForm = z.infer<typeof createMatchSchema>
