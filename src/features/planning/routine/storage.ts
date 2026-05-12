import type { Routine, RoutineBlock, RoutineExercise } from './types'

const KEY = 'ossflow_routines'

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function loadRoutines(): Routine[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Routine[]
  } catch { /* ignore */ }
  return []
}

export function saveRoutines(routines: Routine[]): void {
  localStorage.setItem(KEY, JSON.stringify(routines))
}

export function createRoutine(data: Omit<Routine, 'id' | 'blocks' | 'createdAt' | 'updatedAt'>): Routine {
  const routines = loadRoutines()
  const now = new Date().toISOString()
  const routine: Routine = { ...data, id: uid(), blocks: [], createdAt: now, updatedAt: now }
  saveRoutines([...routines, routine])
  return routine
}

export function updateRoutine(id: string, data: Partial<Omit<Routine, 'id' | 'createdAt'>>): Routine {
  const routines = loadRoutines()
  const updated = routines.map(r =>
    r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r
  )
  saveRoutines(updated)
  return updated.find(r => r.id === id)!
}

export function deleteRoutine(id: string): void {
  saveRoutines(loadRoutines().filter(r => r.id !== id))
}

export function addBlock(routineId: string, data: Omit<RoutineBlock, 'id' | 'exercises'>): Routine {
  const routines = loadRoutines()
  const block: RoutineBlock = { ...data, id: uid(), exercises: [] }
  const updated = routines.map(r =>
    r.id === routineId
      ? { ...r, blocks: [...r.blocks, block], updatedAt: new Date().toISOString() }
      : r
  )
  saveRoutines(updated)
  return updated.find(r => r.id === routineId)!
}

export function updateBlock(routineId: string, blockId: string, data: Partial<Omit<RoutineBlock, 'id' | 'exercises'>>): Routine {
  const routines = loadRoutines()
  const updated = routines.map(r =>
    r.id === routineId
      ? {
          ...r,
          blocks: r.blocks.map(b => b.id === blockId ? { ...b, ...data } : b),
          updatedAt: new Date().toISOString(),
        }
      : r
  )
  saveRoutines(updated)
  return updated.find(r => r.id === routineId)!
}

export function deleteBlock(routineId: string, blockId: string): Routine {
  const routines = loadRoutines()
  const updated = routines.map(r =>
    r.id === routineId
      ? { ...r, blocks: r.blocks.filter(b => b.id !== blockId), updatedAt: new Date().toISOString() }
      : r
  )
  saveRoutines(updated)
  return updated.find(r => r.id === routineId)!
}

export function addExercise(routineId: string, blockId: string, data: Omit<RoutineExercise, 'id'>): Routine {
  const routines = loadRoutines()
  const exercise: RoutineExercise = { ...data, id: uid() }
  const updated = routines.map(r =>
    r.id === routineId
      ? {
          ...r,
          blocks: r.blocks.map(b =>
            b.id === blockId ? { ...b, exercises: [...b.exercises, exercise] } : b
          ),
          updatedAt: new Date().toISOString(),
        }
      : r
  )
  saveRoutines(updated)
  return updated.find(r => r.id === routineId)!
}

export function updateExercise(routineId: string, blockId: string, exerciseId: string, data: Partial<Omit<RoutineExercise, 'id'>>): Routine {
  const routines = loadRoutines()
  const updated = routines.map(r =>
    r.id === routineId
      ? {
          ...r,
          blocks: r.blocks.map(b =>
            b.id === blockId
              ? { ...b, exercises: b.exercises.map(e => e.id === exerciseId ? { ...e, ...data } : e) }
              : b
          ),
          updatedAt: new Date().toISOString(),
        }
      : r
  )
  saveRoutines(updated)
  return updated.find(r => r.id === routineId)!
}

export function deleteExercise(routineId: string, blockId: string, exerciseId: string): Routine {
  const routines = loadRoutines()
  const updated = routines.map(r =>
    r.id === routineId
      ? {
          ...r,
          blocks: r.blocks.map(b =>
            b.id === blockId
              ? { ...b, exercises: b.exercises.filter(e => e.id !== exerciseId) }
              : b
          ),
          updatedAt: new Date().toISOString(),
        }
      : r
  )
  saveRoutines(updated)
  return updated.find(r => r.id === routineId)!
}
