import type { CoachingNotification } from './types'

export const NOTIFICATION_LABELS: Record<CoachingNotification['type'], string> = {
  ATHLETE_JOINED:      '🥋 Nuevo alumno',
  ATHLETE_LEFT:        'Alumno desvinculado',
  COACH_REMOVED_YOU:   'Desvinculado de maestro',
  NOTE_SENT:           'Nueva nota de tu maestro',
  RECOMMENDATION_SENT: '🥋 Nueva recomendación de técnica',
}
