import type { StudyPlan } from '../types'
import type { StudyBlock } from '../../studyblock/types'

export type GanttRow = {
  id: number
  title: string
  startPercent: number
  widthPercent: number
  color: string
}

const COLORS = [
  'bg-blue-400',
  'bg-indigo-400',
  'bg-purple-400',
  'bg-pink-400',
  'bg-rose-400',
  'bg-orange-400',
]

export function buildGanttRows(plan: StudyPlan, blocks: StudyBlock[]): GanttRow[] {
  const planStart = plan.startDate ? new Date(plan.startDate).getTime() : Date.now()
  const planEnd = plan.endDate
    ? new Date(plan.endDate).getTime()
    : planStart + 12 * 7 * 24 * 60 * 60 * 1000
  const totalDuration = planEnd - planStart

  return blocks
    .sort((a, b) => a.blockOrder - b.blockOrder)
    .map((block, index) => {
      if (block.startDate) {
        const startMs = new Date(block.startDate).getTime() - planStart
        const endMs = block.endDate
          ? new Date(block.endDate).getTime() - planStart
          : startMs + 7 * 24 * 60 * 60 * 1000
        const startPercent = Math.max(0, Math.min(100, (startMs / totalDuration) * 100))
        const widthPercent = Math.min(100 - startPercent, ((endMs - startMs) / totalDuration) * 100)
        return {
          id: block.id,
          title: block.title,
          startPercent,
          widthPercent: Math.max(2, widthPercent),
          color: COLORS[index % COLORS.length],
        }
      }
      const widthPercent = 100 / Math.max(1, blocks.length)
      const startPercent = index * widthPercent
      return {
        id: block.id,
        title: block.title,
        startPercent,
        widthPercent,
        color: COLORS[index % COLORS.length],
      }
    })
}
