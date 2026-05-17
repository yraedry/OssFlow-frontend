export const GROUPS = [
  {
    id: 'submission',
    label: 'Sumisión',
    families: ['CHOKES', 'GUILLOTINES', 'TRIANGLES', 'ARMBARS', 'SHOULDER_LOCKS', 'LEG_LOCKS'],
  },
  {
    id: 'pass',
    label: 'Pasaje',
    families: ['GUARD_PASSES'],
  },
  {
    id: 'takedown',
    label: 'Derribo',
    families: ['TAKEDOWNS', 'SWEEPS', 'BACK_TAKES'],
  },
  {
    id: 'guard',
    label: 'Guardia',
    families: ['CLOSED_GUARD', 'HALF_GUARD', 'OPEN_GUARD', 'DLR_GUARD', 'BUTTERFLY_GUARD', 'LEG_ENTANGLEMENT'],
  },
  {
    id: 'escape',
    label: 'Escape',
    families: ['ESCAPES'],
  },
] as const

export type GroupId = typeof GROUPS[number]['id']

export const FAMILY_LABELS: Record<string, string> = {
  CLOSED_GUARD:     'Guardia Cerrada',
  HALF_GUARD:       'Media Guardia',
  OPEN_GUARD:       'Guardia Abierta',
  DLR_GUARD:        'De La Riva',
  BUTTERFLY_GUARD:  'Guardia Mariposa',
  LEG_ENTANGLEMENT: 'Entrelazados',
  GUARD_PASSES:     'Pasajes de Guardia',
  CHOKES:           'Estrangulaciones',
  GUILLOTINES:      'Guillotinas',
  TRIANGLES:        'Triángulos',
  ARMBARS:          'Armbars',
  SHOULDER_LOCKS:   'Kimuras / Americanas',
  LEG_LOCKS:        'Leg Locks',
  TAKEDOWNS:        'Derribos',
  SWEEPS:           'Barridas',
  BACK_TAKES:       'Tomas de Espalda',
  ESCAPES:          'Escapadas',
  OTHER:            'Otro',
}
