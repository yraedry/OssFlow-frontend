export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
export type SessionType = 'BJJ' | 'STRENGTH' | 'CARDIO' | 'MOBILITY' | 'FLEXIBILITY'

export interface SessionSlot {
  type: SessionType
  time?: string  // "HH:mm" opcional
}

export interface DayEntry {
  dayOfWeek: DayOfWeek
  sessions: SessionSlot[]
}

export interface WeeklyTemplate {
  id: number | null
  days: DayEntry[]
  updatedAt: string | null
}

export const ALL_DAYS: DayOfWeek[] = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
]

export const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
}
