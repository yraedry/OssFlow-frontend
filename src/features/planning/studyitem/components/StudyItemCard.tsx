import { Trash2 } from 'lucide-react'
import type { StudyItem, ItemStatus } from '../types'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)' }

const NEXT_STATUS: Partial<Record<ItemStatus, { to: ItemStatus; label: string }[]>> = {
  TODO:    [{ to: 'DOING', label: 'Iniciar' }],
  DOING:   [{ to: 'DONE', label: 'Completar' }, { to: 'SKIPPED', label: 'Saltar' }],
  DONE:    [{ to: 'TODO', label: 'Reabrir' }],
  SKIPPED: [{ to: 'TODO', label: 'Reabrir' }],
}

type StudyItemCardProps = {
  item: StudyItem
  accentColor: string
  onTransition: (itemId: number, targetStatus: ItemStatus) => void
  onDelete: (itemId: number) => void
}

export function StudyItemCard({ item, accentColor, onTransition, onDelete }: StudyItemCardProps) {
  const transitions = NEXT_STATUS[item.status] ?? []

  return (
    <div className="group border border-border bg-background hover:border-foreground/30 transition-colors p-2.5">
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium leading-snug">{item.title}</p>
          {item.description && (
            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2" style={MONO}>{item.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" strokeWidth={1.5} />
        </button>
      </div>

      {transitions.length > 0 && (
        <div className="flex gap-1 mt-2">
          {transitions.map(({ to, label }) => (
            <button
              key={to}
              type="button"
              onClick={() => onTransition(item.id, to)}
              className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 border transition-colors hover:opacity-80"
              style={{
                ...MONO,
                borderColor: accentColor + '60',
                color: accentColor,
                backgroundColor: accentColor + '10',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
