export type Intensity = 'LIGHT' | 'MODERATE' | 'HARD' | 'COMPETITION'
export type SessionType = 'BJJ' | 'PHYSICAL' | 'CARDIO'

export interface TrainingSession {
  id: number
  sessionDate: string
  durationMinutes: number
  location?: string
  intensity: Intensity
  sessionType: SessionType
  notesMarkdown?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTrainingSessionRequest {
  sessionDate: string
  durationMinutes: number
  location?: string
  intensity: Intensity
  sessionType: SessionType
  notesMarkdown?: string
}
