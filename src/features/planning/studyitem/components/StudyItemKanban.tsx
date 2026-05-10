import { Spinner } from '@/shared/components/ui/spinner'
import { useStudyItems, useTransitionStudyItem, useDeleteStudyItem } from '../hooks'
import { StudyItemCard } from './StudyItemCard'
import type { ItemStatus, StudyItem } from '../types'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)' }

const COLUMNS: { status: ItemStatus; label: string; color: string }[] = [
  { status: 'TODO',    label: 'Por hacer',  color: '#6b7280' },
  { status: 'DOING',   label: 'En curso',   color: '#3b82f6' },
  { status: 'DONE',    label: 'Completado', color: '#10b981' },
  { status: 'SKIPPED', label: 'Saltado',    color: '#f59e0b' },
]

type KanbanColumnProps = {
  status: ItemStatus
  label: string
  color: string
  items: StudyItem[]
  planId: number
  blockId: number
}

function KanbanColumn({ status, label, color, items, planId, blockId }: KanbanColumnProps) {
  const transitionMutation = useTransitionStudyItem(planId, blockId)
  const deleteMutation = useDeleteStudyItem(planId, blockId)

  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div className="flex items-center gap-2 pb-1 border-b border-border/50">
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground" style={MONO}>
          {label}
        </span>
        {items.length > 0 && (
          <span className="text-[10px] font-bold ml-auto" style={{ ...MONO, color }}>{items.length}</span>
        )}
      </div>
      <div className="space-y-1.5">
        {items.length === 0 ? (
          <p className="text-[10px] text-muted-foreground/50 text-center py-3" style={MONO}>—</p>
        ) : (
          items.map((item) => (
            <StudyItemCard
              key={item.id}
              item={item}
              accentColor={color}
              onTransition={(itemId, targetStatus) => transitionMutation.mutate({ itemId, targetStatus })}
              onDelete={(itemId) => deleteMutation.mutate(itemId)}
            />
          ))
        )}
      </div>
    </div>
  )
}

type StudyItemKanbanProps = {
  planId: number
  blockId: number
}

export function StudyItemKanban({ planId, blockId }: StudyItemKanbanProps) {
  const { data, isLoading } = useStudyItems(planId, blockId)

  if (isLoading) return <div className="flex justify-center py-4"><Spinner /></div>

  const items = data?.content ?? []

  return (
    <div className="grid grid-cols-4 gap-4">
      {COLUMNS.map(({ status, label, color }) => (
        <KanbanColumn
          key={status}
          status={status}
          label={label}
          color={color}
          items={items.filter(i => i.status === status)}
          planId={planId}
          blockId={blockId}
        />
      ))}
    </div>
  )
}
