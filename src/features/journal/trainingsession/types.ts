export type Intensity = 'LOW' | 'MODERATE' | 'HIGH' | 'COMPETITION'

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
