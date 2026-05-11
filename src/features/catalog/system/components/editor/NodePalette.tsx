import { usePositions } from '@/features/catalog/position/hooks'
import { useTechniques } from '@/features/catalog/technique/hooks'

type NodePaletteProps = {
  className?: string
}

function handleDragStart(
  event: React.DragEvent,
  type: 'position' | 'technique',
  entityId: number,
  label: string,
) {
  event.dataTransfer.setData(
    'application/ossflow-node',
    JSON.stringify({ type, entityId, label }),
  )
  event.dataTransfer.effectAllowed = 'move'
}

export function NodePalette({ className }: NodePaletteProps) {
  const { data: positionsPage } = usePositions({ page: 0, size: 50 })
  const { data: techniquesPage } = useTechniques({ page: 0, size: 50 })

  const positions = positionsPage?.content ?? []
  const techniques = techniquesPage?.content ?? []

  return (
    <div className={`flex flex-col gap-4 overflow-y-auto p-3 ${className ?? ''}`}>
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground mb-2">
          Posiciones
        </h3>
        <div className="flex flex-col gap-1">
          {positions.map(pos => (
            <div
              key={pos.id}
              draggable
              onDragStart={e => handleDragStart(e, 'position', pos.id, pos.name)}
              className="rounded-none border-2 border-border bg-muted px-3 py-2 text-xs font-medium cursor-grab active:cursor-grabbing hover:border-foreground transition-colors select-none"
            >
              {pos.name}
            </div>
          ))}
          {positions.length === 0 && (
            <p className="text-xs text-muted-foreground italic">Sin posiciones</p>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Técnicas
        </h3>
        <div className="flex flex-col gap-1">
          {techniques.map(tech => (
            <div
              key={tech.id}
              draggable
              onDragStart={e => handleDragStart(e, 'technique', tech.id, tech.name)}
              className="rounded-none border-2 border-border bg-muted px-3 py-2 text-xs font-medium cursor-grab active:cursor-grabbing hover:border-foreground transition-colors select-none"
            >
              {tech.name}
            </div>
          ))}
          {techniques.length === 0 && (
            <p className="text-xs text-muted-foreground italic">Sin técnicas</p>
          )}
        </div>
      </section>
    </div>
  )
}
