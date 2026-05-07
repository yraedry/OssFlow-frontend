import { describe, it, expect } from 'vitest'
import { buildGanttRows } from './lib/ganttMapper'
import type { StudyPlan } from './types'
import type { StudyBlock } from '../studyblock/types'

describe('buildGanttRows', () => {
  const plan: StudyPlan = {
    id: 1,
    title: 'Plan',
    status: 'ACTIVE',
    startDate: '2026-06-01',
    endDate: '2026-09-01',
    createdAt: '',
    updatedAt: '',
  }

  it('returns one row per block', () => {
    const blocks: StudyBlock[] = [
      { id: 1, planId: 1, title: 'Bloque 1', orderIndex: 0, createdAt: '', updatedAt: '' },
      { id: 2, planId: 1, title: 'Bloque 2', orderIndex: 1, createdAt: '', updatedAt: '' },
    ]
    const rows = buildGanttRows(plan, blocks)
    expect(rows).toHaveLength(2)
  })

  it('rows with weekNumber have non-zero startPercent', () => {
    const blocks: StudyBlock[] = [
      {
        id: 1,
        planId: 1,
        title: 'Bloque 2',
        weekNumber: 2,
        orderIndex: 0,
        createdAt: '',
        updatedAt: '',
      },
    ]
    const rows = buildGanttRows(plan, blocks)
    expect(rows[0].startPercent).toBeGreaterThan(0)
  })
})
