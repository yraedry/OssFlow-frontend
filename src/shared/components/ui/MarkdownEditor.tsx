import { useRef } from 'react'
import { Bold, Italic, List, ListOrdered, Minus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

type Props = {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  disabled?: boolean
  className?: string
}

type WrapOpts = { before: string; after: string; placeholder: string }

export function MarkdownEditor({ value, onChange, placeholder, rows = 5, disabled, className }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)

  function insertAtCursor(before: string, after = '', placeholderText = '') {
    const el = ref.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = value.slice(start, end)
    const insertion = selected ? `${before}${selected}${after}` : `${before}${placeholderText}${after}`
    const next = value.slice(0, start) + insertion + value.slice(end)
    onChange(next)
    // Restore cursor after React re-render
    requestAnimationFrame(() => {
      el.focus()
      const cursor = selected
        ? start + before.length + selected.length + after.length
        : start + before.length + placeholderText.length
      el.setSelectionRange(cursor, cursor)
    })
  }

  function insertLinePrefix(prefix: string) {
    const el = ref.current
    if (!el) return
    const start = el.selectionStart
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const alreadyHas = value.slice(lineStart).startsWith(prefix)
    if (alreadyHas) {
      const next = value.slice(0, lineStart) + value.slice(lineStart + prefix.length)
      onChange(next)
    } else {
      const next = value.slice(0, lineStart) + prefix + value.slice(lineStart)
      onChange(next)
      requestAnimationFrame(() => {
        el.focus()
        el.setSelectionRange(start + prefix.length, start + prefix.length)
      })
    }
  }

  const tools = [
    { icon: Bold,         label: 'Negrita',        action: () => insertAtCursor('**', '**', 'texto') },
    { icon: Italic,       label: 'Cursiva',         action: () => insertAtCursor('*', '*', 'texto') },
    { icon: List,         label: 'Lista',           action: () => insertLinePrefix('- ') },
    { icon: ListOrdered,  label: 'Lista numerada',  action: () => insertLinePrefix('1. ') },
    { icon: Minus,        label: 'Separador',       action: () => insertAtCursor('\n---\n', '', '') },
  ]

  return (
    <div className={cn('border border-border bg-card', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border/50">
        {tools.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            type="button"
            title={label}
            onMouseDown={e => { e.preventDefault(); action() }}
            disabled={disabled}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors disabled:opacity-30"
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        ))}
        <span className="ml-auto font-mono text-[9px] text-muted-foreground/30 uppercase tracking-widest pr-1">
          markdown
        </span>
      </div>
      {/* Textarea */}
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
