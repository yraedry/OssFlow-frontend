import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'ossflow_weekly_visual'

type SessionType = 'BJJ' | 'FISICO' | 'DESCANSO' | 'VIDEO'

type CalendarBlock = {
  type: SessionType
}

type CalendarData = Record<string, Record<number, CalendarBlock>>
// key: "MONDAY", value: { 8: { type: 'BJJ' }, 19: { type: 'FISICO' } }

const SESSION_TYPES: { type: SessionType; label: string; color: string; bg: string }[] = [
  { type: 'BJJ', label: 'BJJ', color: '#4a7cff', bg: 'rgba(74,124,255,0.15)' },
  { type: 'FISICO', label: 'Físico', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  { type: 'DESCANSO', label: 'Descanso', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
  { type: 'VIDEO', label: 'Video', color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
]

const DAYS: { key: string; label: string }[] = [
  { key: 'MONDAY', label: 'LUN' },
  { key: 'TUESDAY', label: 'MAR' },
  { key: 'WEDNESDAY', label: 'MIÉ' },
  { key: 'THURSDAY', label: 'JUE' },
  { key: 'FRIDAY', label: 'VIE' },
  { key: 'SATURDAY', label: 'SÁB' },
  { key: 'SUNDAY', label: 'DOM' },
]

const HOURS: number[] = Array.from({ length: 17 }, (_, i) => i + 6) // 6..22

const LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '9px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
}

function loadData(): CalendarData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as CalendarData
  } catch { /* ignore */ }
  return {}
}

function saveData(data: CalendarData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function getTypeInfo(type: SessionType) {
  return SESSION_TYPES.find((s) => s.type === type) ?? SESSION_TYPES[0]
}

type CellPickerProps = {
  day: string
  hour: number
  block: CalendarBlock | undefined
  onSet: (day: string, hour: number, type: SessionType | null) => void
}

function CellPicker({ day, hour, block, onSet }: CellPickerProps) {
  const [open, setOpen] = useState(false)

  function handleClick() {
    if (block) {
      // Toggle off on direct click if already set
      setOpen((v) => !v)
    } else {
      setOpen((v) => !v)
    }
  }

  function handleSelect(type: SessionType) {
    onSet(day, hour, type)
    setOpen(false)
  }

  function handleRemove() {
    onSet(day, hour, null)
    setOpen(false)
  }

  const info = block ? getTypeInfo(block.type) : null

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        className="w-full h-8 flex items-center justify-center transition-colors hover:bg-accent/50 focus:outline-none"
        style={{
          backgroundColor: info ? info.bg : undefined,
          borderBottom: '1px solid var(--color-border)',
        }}
        title={info ? info.label : `Añadir sesión ${hour}:00`}
      >
        {info && (
          <span
            className="px-1.5 py-0.5 rounded-full truncate max-w-full"
            style={{
              ...LABEL,
              fontSize: '8px',
              color: info.color,
              backgroundColor: info.bg,
              border: `1px solid ${info.color}33`,
            }}
          >
            {info.label}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Picker */}
          <div
            className="absolute z-50 top-full left-0 min-w-[120px] border border-border bg-background shadow-xl"
            style={{ marginTop: '2px' }}
          >
            {SESSION_TYPES.map((s) => (
              <button
                key={s.type}
                type="button"
                onClick={() => handleSelect(s.type)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent transition-colors text-left"
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span style={{ ...LABEL, color: 'var(--color-foreground)' }}>{s.label}</span>
              </button>
            ))}
            {block && (
              <button
                type="button"
                onClick={handleRemove}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-destructive/10 hover:text-destructive transition-colors text-left border-t border-border"
              >
                <span style={{ ...LABEL, color: 'inherit' }}>Quitar</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export function WeeklyCalendar() {
  const [data, setData] = useState<CalendarData>(loadData)

  useEffect(() => {
    saveData(data)
  }, [data])

  const handleSet = useCallback((day: string, hour: number, type: SessionType | null) => {
    setData((prev) => {
      const next = { ...prev }
      if (!next[day]) next[day] = {}
      if (type === null) {
        const dayData = { ...next[day] }
        delete dayData[hour]
        next[day] = dayData
      } else {
        next[day] = { ...next[day], [hour]: { type } }
      }
      return next
    })
  }, [])

  function handleClear() {
    setData({})
  }

  const totalBlocks = Object.values(data).reduce((acc, d) => acc + Object.keys(d).length, 0)

  return (
    <div className="space-y-3">
      {/* Legend + clear */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          {SESSION_TYPES.map((s) => (
            <div key={s.type} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span style={{ ...LABEL, color: 'var(--color-muted-foreground)' }}>{s.label}</span>
            </div>
          ))}
        </div>
        {totalBlocks > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="border border-border px-2.5 py-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors"
            style={{ ...LABEL, color: 'var(--color-muted-foreground)' }}
          >
            Limpiar semana
          </button>
        )}
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto scrollbar-thin">
        <div style={{ minWidth: '560px' }}>
          {/* Header row */}
          <div
            className="grid border-b border-border bg-card"
            style={{ gridTemplateColumns: '40px repeat(7, 1fr)' }}
          >
            <div className="py-2" />
            {DAYS.map((d) => (
              <div
                key={d.key}
                className="py-2 text-center"
                style={{ ...LABEL, color: 'var(--color-muted-foreground)' }}
              >
                {d.label}
              </div>
            ))}
          </div>

          {/* Hour rows */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="grid"
              style={{ gridTemplateColumns: '40px repeat(7, 1fr)' }}
            >
              {/* Hour label */}
              <div
                className="flex items-start justify-end pr-2 pt-1 shrink-0"
                style={{ ...LABEL, fontSize: '8px', color: 'var(--color-muted-foreground)', paddingTop: '6px' }}
              >
                {String(hour).padStart(2, '0')}h
              </div>
              {/* Day cells */}
              {DAYS.map((d) => (
                <CellPicker
                  key={d.key}
                  day={d.key}
                  hour={hour}
                  block={data[d.key]?.[hour]}
                  onSet={handleSet}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <p style={{ ...LABEL, fontSize: '8px', color: 'var(--color-muted-foreground)' }}>
        Haz click en cualquier celda para añadir o cambiar el tipo de sesión. Los cambios se guardan automáticamente.
      </p>
    </div>
  )
}
