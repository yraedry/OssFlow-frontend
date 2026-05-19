import { useRef } from 'react'
import { Bold, Italic, List, ListOrdered, Minus, type LucideIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

type Props = {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  disabled?: boolean
  className?: string
}

type ToolDef = { icon: LucideIcon; label: string; before: string; after?: string; placeholder?: string; linePrefix?: string }

const TOOLS: ToolDef[] = [
  { icon: Bold,        label: 'Negrita',       before: '**', after: '**', placeholder: 'texto' },
  { icon: Italic,      label: 'Cursiva',        before: '*',  after: '*',  placeholder: 'texto' },
  { icon: List,        label: 'Lista',          before: '',   linePrefix: '- ' },
  { icon: ListOrdered, label: 'Lista numerada', before: '',   linePrefix: '1. ' },
  { icon: Minus,       label: 'Separador',      before: '\n---\n' },
]

export function MarkdownEditor({ value, onChange, placeholder, rows = 5, disabled, className }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)

  function applyTool(tool: ToolDef) {
    const el = ref.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd

    if (tool.linePrefix) {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1
      if (value.slice(lineStart).startsWith(tool.linePrefix)) {
        onChange(value.slice(0, lineStart) + value.slice(lineStart + tool.linePrefix.length))
      } else {
        onChange(value.slice(0, lineStart) + tool.linePrefix + value.slice(lineStart))
        requestAnimationFrame(() => {
          el.focus()
          el.setSelectionRange(start + tool.linePrefix!.length, start + tool.linePrefix!.length)
        })
      }
      return
    }

    const before = tool.before
    const after = tool.after ?? ''
    const ph = tool.placeholder ?? ''
    const selected = value.slice(start, end)
    const insertion = selected ? `${before}${selected}${after}` : `${before}${ph}${after}`
    onChange(value.slice(0, start) + insertion + value.slice(end))
    requestAnimationFrame(() => {
      el.focus()
      const cursor = selected
        ? start + before.length + selected.length + after.length
        : start + before.length + ph.length
      el.setSelectionRange(cursor, cursor)
    })
  }

  return (
    <div className={cn('border border-border bg-card', className)}>
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border/50">
        {TOOLS.map((tool) => {
          const Icon = tool.icon
          return (
            <button
              key={tool.label}
              type="button"
              title={tool.label}
              onMouseDown={e => { e.preventDefault(); applyTool(tool) }}
              disabled={disabled}
              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors disabled:opacity-30"
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          )
        })}
        <span className="ml-auto font-mono text-[9px] text-muted-foreground/30 uppercase tracking-widest pr-1">
          markdown
        </span>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className="w-full bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground/40 p-3 font-mono leading-relaxed"
      />
    </div>
  )
}
