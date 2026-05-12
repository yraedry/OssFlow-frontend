import { z } from 'zod'

const DAY_OF_WEEK = z.enum([
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
])

const SESSION_TYPE = z.enum(['BJJ', 'STRENGTH', 'CARDIO', 'MOBILITY', 'FLEXIBILITY'])

export const sessionSlotSchema = z.object({
  type: SESSION_TYPE,
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
})

export const dayEntrySchema = z.object({
  dayOfWeek: DAY_OF_WEEK,
  sessions: z.array(sessionSlotSchema),
})

export const saveWeeklyTemplateSchema = z.object({
  days: z.array(dayEntrySchema).max(7).refine(
    (days) => new Set(days.map((d) => d.dayOfWeek)).size === days.length,
    { message: 'Cada día de la semana solo puede aparecer una vez' },
  ),
})

export type SaveWeeklyTemplateForm = z.infer<typeof saveWeeklyTemplateSchema>
