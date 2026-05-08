export type InjurySeverity = 'MILD' | 'MODERATE' | 'SEVERE'
export type InjuryStatus = 'ACTIVE' | 'RECOVERED' | 'CHRONIC'

export const SEVERITY_LABELS: Record<InjurySeverity, string> = {
  MILD: 'Leve',
  MODERATE: 'Moderada',
  SEVERE: 'Grave',
}

export const STATUS_LABELS: Record<InjuryStatus, string> = {
  ACTIVE: 'Activa',
  RECOVERED: 'Recuperada',
  CHRONIC: 'Crónica',
}

export const STATUS_COLORS: Record<InjuryStatus, string> = {
  ACTIVE: 'bg-red-100 text-red-800',
  RECOVERED: 'bg-green-100 text-green-800',
  CHRONIC: 'bg-yellow-100 text-yellow-800',
}

export interface Injury {
  id: number
  bodyPart: string
  description?: string
  severity: InjurySeverity
  status: InjuryStatus
  startedOn?: string
  recoveredOn?: string
}

export interface CreateInjuryRequest {
  bodyPart: string
  description?: string
  severity: InjurySeverity
  status: InjuryStatus
  startedOn?: string
  recoveredOn?: string
}
