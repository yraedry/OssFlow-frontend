export type PhysicalSessionType = 'STRENGTH' | 'CARDIO' | 'FLEXIBILITY' | 'HIIT' | 'OTHER'

export const PHYSICAL_SESSION_TYPE_LABELS: Record<PhysicalSessionType, string> = {
  STRENGTH: 'Fuerza',
  CARDIO: 'Cardio',
  FLEXIBILITY: 'Flexibilidad',
  HIIT: 'HIIT',
  OTHER: 'Otro',
}

export interface PhysicalSession {
  id: number
  sessionDate: string
  sessionType: PhysicalSessionType
  title: string
  durationMinutes?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePhysicalSessionRequest {
  sessionDate: string
  sessionType: PhysicalSessionType
  title: string
  durationMinutes?: number
  notes?: string
}
