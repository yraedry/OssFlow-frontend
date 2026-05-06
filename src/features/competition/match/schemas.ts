import { z } from 'zod'

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
