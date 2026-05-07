export type Intensity = 'LIGHT' | 'MODERATE' | 'HARD' | 'COMPETITION'

export interface TrainingSession {
  id: number
  sessionDate: string
  durationMinutes: number
  location?: string
  intensity: Intensity
  notesMarkdown?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTrainingSessionRequest {
  sessionDate: string
  durationMinutes: number
  location?: string
  intensity: Intensity
  notesMarkdown?: string
}
