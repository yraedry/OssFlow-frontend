export const BELTS = [
  { value: 'WHITE',  label: 'Blanco',  color: '#d1d5db', text: '#111827' },
  { value: 'BLUE',   label: 'Azul',    color: '#3b82f6', text: '#ffffff' },
  { value: 'PURPLE', label: 'Morado',  color: '#9333ea', text: '#ffffff' },
  { value: 'BROWN',  label: 'Marrón',  color: '#92400e', text: '#ffffff' },
  { value: 'BLACK',  label: 'Negro',   color: '#111827', text: '#ffffff' },
]

export const BELT_ORDER = ['WHITE', 'BLUE', 'PURPLE', 'BROWN', 'BLACK'] as const

export const MODALITIES = [
  { value: 'GI',   label: 'Gi (con kimono)' },
  { value: 'NOGI', label: 'No-Gi (sin kimono)' },
  { value: 'BOTH', label: 'Gi + No-Gi (ambas)' },
]

export const AGE_CATEGORIES = [
  { value: 'ADULT',    label: 'Adulto' },
  { value: 'JUVENILE', label: 'Juvenil' },
  { value: 'MASTER_1', label: 'Master 1' },
  { value: 'MASTER_2', label: 'Master 2' },
  { value: 'MASTER_3', label: 'Master 3' },
  { value: 'MASTER_4', label: 'Master 4' },
]

export const STRIPES_OPTIONS = [0, 1, 2, 3, 4] as const
