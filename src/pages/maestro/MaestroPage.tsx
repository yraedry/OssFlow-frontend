import { useState } from 'react'
import { MyCoachesSection } from '@/features/coaching/components/MyCoachesSection'
import { ReceivedNoteList } from '@/features/coaching/notes/ReceivedNoteList'
import { useNoteUnreadCount } from '@/features/coaching/hooks'

type Tab = 'maestros' | 'notas' | 'planificacion'

const TAB_LABELS: Record<Tab, string> = {
  maestros: 'Mis maestros',
  notas: 'Notas',
  planificacion: 'Planificación',
}

export function MaestroPage() {
  const [tab, setTab] = useState<Tab>('maestros')
  const { data: unreadCount } = useNoteUnreadCount()
  const count = unreadCount ?? 0

  return (
    <div className="space-y-4">
      <div className="border border-border bg-card overflow-hidden">
        <div className="flex border-b border-border">
          {(['maestros', 'notas', 'planificacion'] as Tab[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 px-4 py-3 text-xs font-mono uppercase tracking-wide transition-colors border-b-2 flex items-center justify-center gap-1 ${
                tab === t
                  ? 'font-semibold border-[#f97316] text-[#f97316]'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              {TAB_LABELS[t]}
              {t === 'notas' && count > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 px-1 text-[10px] font-bold bg-purple-500 text-white rounded-full">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="p-4">
          {tab === 'maestros' && <MyCoachesSection />}
          {tab === 'notas' && <ReceivedNoteList />}
          {tab === 'planificacion' && (
            <div className="border border-dashed border-border/50 px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground font-mono">
                Tu maestro aún no ha añadido planificación para ti.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
