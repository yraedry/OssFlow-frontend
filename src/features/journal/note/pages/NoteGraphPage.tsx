import { useRef, useEffect, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { useNotes } from '../hooks'
import { buildNoteGraph } from '../lib/graphBuilder'
import { Spinner } from '@/shared/components/ui/spinner'

export function NoteGraphPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  const { data, isLoading } = useNotes({ page: 0, size: 200 })

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner />
      </div>
    )
  }

  const notes = data?.content ?? []
  const graphData = buildNoteGraph(notes)

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p className="text-lg">No hay notas todavía.</p>
        <p className="text-sm">Crea notas con etiquetas para ver el grafo de conexiones.</p>
      </div>
    )
  }

  if (graphData.links.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Grafo de Notas</h1>
          <p className="text-muted-foreground text-sm">{notes.length} notas · sin conexiones</p>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <p className="text-lg">Ninguna nota comparte etiquetas.</p>
          <p className="text-sm">Añade etiquetas comunes a tus notas para crear conexiones.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold">Grafo de Notas</h1>
        <p className="text-muted-foreground text-sm">
          {notes.length} notas · {graphData.links.length} conexiones
        </p>
      </div>
      <div ref={containerRef} className="flex-1 border bg-card overflow-hidden min-h-[500px]">
        <ForceGraph2D
          graphData={graphData}
          width={dimensions.width || 800}
          height={dimensions.height || 500}
          nodeLabel="name"
          nodeColor={(node) => (node as { color?: string }).color ?? '#94a3b8'}
          nodeVal={(node) => (node as { val?: number }).val ?? 1}
          linkLabel="label"
          backgroundColor="transparent"
          nodeCanvasObjectMode={() => 'after'}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = (node as { name?: string }).name ?? ''
            const fontSize = Math.max(8, 12 / globalScale)
            ctx.font = `${fontSize}px Sans-Serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.fillStyle = 'rgba(120,120,120,0.8)'
            ctx.fillText(label, node.x ?? 0, (node.y ?? 0) + 6)
          }}
        />
      </div>
    </div>
  )
}
