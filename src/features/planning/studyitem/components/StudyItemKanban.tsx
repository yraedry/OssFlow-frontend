import { Spinner } from '@/shared/components/ui/spinner'
import { useStudyItems, useTransitionStudyItem, useDeleteStudyItem } from '../hooks'
import { StudyItemCard } from './StudyItemCard'
import type { ItemStatus, StudyItem } from '../types'

type KanbanColumnProps = {
  title: string
  items: StudyItem[]
  colorClass: string
  planId: number
  blockId: number
}

function KanbanColumn({ title, items, colorClass, planId, blockId }: KanbanColumnProps) {
  const transitionMutation = useTransitionStudyItem(planId, blockId)
  const deleteMutation = useDeleteStudyItem(planId, blockId)

  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div className={`rounded px-2 py-1 text-xs font-semibold ${colorClass}`}>
        {title} ({items.length})
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <StudyItemCard
            key={item.id}
            item={item}
            onTransition={(itemId, targetStatus) =>
              transitionMutation.mutate({ itemId, targetStatus })
            }
            onDelete={(itemId) => deleteMutation.mutate(itemId)}
          />
        ))}
      </div>
    </div>
  )
}

type StudyItemKanbanProps = {
  planId: number
  blockId: number
}

const COLUMNS: { status: ItemStatus; label: string; colorClass: string }[] = [
  { status: 'TODO', label: 'Por hacer', colorClass: 'bg-gray-100 text-gray-700' },
  { status: 'DOING', label: 'En curso', colorClass: 'bg-blue-100 text-blue-700' },
  { status: 'DONE', label: 'Completado', colorClass: 'bg-green-100 text-green-700' },
  { status: 'SKIPPED', label: 'Saltado', colorClass: 'bg-orange-100 text-orange-700' },
]

export function StudyItemKanban({ planId, blockId }: StudyItemKanbanProps) {
  const { data, isLoading } = useStudyItems(planId, blockId)

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner />
      </div>
    )
  }

  const items = data?.content ?? []

  return (
    <div className="grid grid-cols-4 gap-3 pt-2">
      {COLUMNS.map(({ status, label, colorClass }) => (
        <KanbanColumn
          key={status}
          title={label}
          items={items.filter((i) => i.status === status)}
          colorClass={colorClass}
          planId={planId}
          blockId={blockId}
        />
      ))}
    </div>
  )
}
