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
      { id: 1, studyPlanId: 1, title: 'Bloque 1', blockOrder: 0, createdAt: '', updatedAt: '' },
      { id: 2, studyPlanId: 1, title: 'Bloque 2', blockOrder: 1, createdAt: '', updatedAt: '' },
    ]
    const rows = buildGanttRows(plan, blocks)
    expect(rows).toHaveLength(2)
  })

  it('rows with startDate have non-zero startPercent', () => {
    const blocks: StudyBlock[] = [
      {
        id: 1,
        studyPlanId: 1,
        title: 'Bloque 2',
        startDate: '2026-07-01',
        blockOrder: 0,
        createdAt: '',
        updatedAt: '',
      },
    ]
    const rows = buildGanttRows(plan, blocks)
    expect(rows[0].startPercent).toBeGreaterThan(0)
  })
})
