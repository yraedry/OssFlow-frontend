export type PrivateSession = {
  id: number
  coachId: number
  athleteId: number
  gymId: number | null
  sessionDate: string        // ISO date "2026-05-17"
  startTime: string | null   // "HH:MM:SS"
  durationMinutes: number | null
  title: string | null
  notes: string | null
  techniquesWorked: string[]
  createdAt: string
}

export type CreatePrivateSessionPayload = {
  athleteId: number
  gymId?: number | null
  sessionDate: string
  startTime?: string | null
  durationMinutes?: number | null
  title?: string | null
  notes?: string | null
  techniquesWorked?: string[]
}

export type UpdatePrivateSessionPayload = {
  gymId?: number | null
  sessionDate?: string
  startTime?: string | null
  durationMinutes?: number | null
  title?: string | null
  notes?: string | null
  techniquesWorked?: string[]
}
