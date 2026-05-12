import type { ExerciseCategory } from '@/features/catalog/exercise/types'

export type RoutineCategory = Extract<ExerciseCategory, 'STRENGTH' | 'CARDIO' | 'MOBILITY' | 'FLEXIBILITY' | 'CORE'>

export const ROUTINE_CATEGORIES: { key: RoutineCategory; label: string; color: string }[] = [
  { key: 'STRENGTH',    label: 'Fuerza',       color: '#f59e0b' },
  { key: 'CARDIO',      label: 'Cardio',       color: '#10b981' },
  { key: 'MOBILITY',    label: 'Movilidad',    color: '#a855f7' },
  { key: 'FLEXIBILITY', label: 'Flexibilidad', color: '#06b6d4' },
  { key: 'CORE',        label: 'Core',         color: '#3b82f6' },
]

export interface RoutineExercise {
  id: string
  exerciseId: number
  exerciseName: string
  sets: number
  reps?: number
  durationSeconds?: number
  weightKg?: number
  notes?: string
}

export interface RoutineBlock {
  id: string
  name: string
  rounds: number
  restSeconds?: number
  trigger: 'AM' | 'PM' | 'SESSION'
  exercises: RoutineExercise[]
}

export interface Routine {
  id: string
  name: string
  category: RoutineCategory
  description?: string
  estimatedMinutes?: number
  blocks: RoutineBlock[]
  createdAt: string
  updatedAt: string
}
