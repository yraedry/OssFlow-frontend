import { useState } from 'react'
import { ALL_DAYS, DAY_LABELS } from '../types'
import type { DayOfWeek, SessionType, WeeklyTemplate } from '../types'
import type { SaveWeeklyTemplateForm } from '../schemas'
import { MONO } from '@/shared/lib/typography'

const SESSION_TYPES: { key: SessionType; label: string; color: string }[] = [
  { key: 'BJJ',         label: 'BJJ',         color: '#4a7cff' },
  { key: 'STRENGTH',    label: 'Fuerza',       color: '#f59e0b' },
  { key: 'CARDIO',      label: 'Cardio',       color: '#10b981' },
  { key: 'MOBILITY',    label: 'Movilidad',    color: '#a855f7' },
  { key: 'FLEXIBILITY', label: 'Flexibilidad', color: '#06b6d4' },
]

const DAY_SHORT: Record<DayOfWeek, string> = {
  MONDAY: 'Lun', TUESDAY: 'Mar', WEDNESDAY: 'Mié',
  THURSDAY: 'Jue', FRIDAY: 'Vie', SATURDAY: 'Sáb', SUNDAY: 'Dom',
}

type Slot = { type: SessionType; time?: string }
type State = Record<DayOfWeek, Slot[]>

function buildFromTemplate(template: WeeklyTemplate): State {
  const base = ALL_DAYS.reduce<State>((acc, d) => { acc[d] = []; return acc }, {} as State)
  for (const day of template.days) {
    base[day.dayOfWeek] = day.sessions.map(s => ({ type: s.type, time: s.time }))
  }
  return base
}

function buildEmpty(): State {
  return ALL_DAYS.reduce<State>((acc, d) => { acc[d] = []; return acc }, {} as State)
}

type Props = {
  template: WeeklyTemplate
  onSave: (data: SaveWeeklyTemplateForm) => void
  isPending: boolean
}

export function WeeklyTemplateForm({ template, onSave, isPending }: Props) {
  const [state, setState] = useState<State>(() =>
    template.days.length > 0 ? buildFromTemplate(template) : buildEmpty()
  )
  const [expanded, setExpanded] = useState<DayOfWeek | null>(null)

  function isActive(day: DayOfWeek, type: SessionType) {
    return state[day].some(s => s.type === type)
  }

  function toggleCell(day: DayOfWeek, type: SessionType) {
    setState(prev => {
      const slots = prev[day]
      if (slots.some(s => s.type === type)) {
        return { ...prev, [day]: slots.filter(s => s.type !== type) }
      }
      return { ...prev, [day]: [...slots, { type }] }
    })
  }

  function setTime(day: DayOfWeek, type: SessionType, slotIdx: number, value: string) {
    setState(prev => {
      const positions = prev[day].reduce<number[]>((acc, s, i) => s.type === type ? [...acc, i] : acc, [])
      const slots = [...prev[day]]
      slots[positions[slotIdx]] = { ...slots[positions[slotIdx]], time: value || undefined }
      return { ...prev, [day]: slots }
    })
  }

  function addSlot(day: DayOfWeek, type: SessionType) {
    setState(prev => ({ ...prev, [day]: [...prev[day], { type }] }))
  }

  function removeSlot(day: DayOfWeek, type: SessionType, slotIdx: number) {
    setState(prev => {
      let count = -1
      return {
        ...prev,
        [day]: prev[day].filter(s => {
          if (s.type !== type) return true
          count++
          return count !== slotIdx
        }),
      }
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      days: ALL_DAYS
        .filter(day => state[day].length > 0)
        .map(day => ({ dayOfWeek: day, sessions: state[day].map(s => ({ type: s.type, time: s.time })) })),
    })
  }

  const activeDayCount = ALL_DAYS.filter(d => state[d].length > 0).length

  return (
    <form onSubmit={handleSubmit} className="space-y-3">

      {/* Tabla semanal */}
      <div className="border border-border overflow-hidden">
        {/* Header: días */}
        <div className="grid border-b border-border" style={{ gridTemplateColumns: '72px repeat(7, 1fr)' }}>
          <div className="border-r border-border" />
          {ALL_DAYS.map(day => {
            const hasAny = state[day].length > 0
            return (
              <div
                key={day}
                className="flex flex-col items-center justify-center py-1.5 border-r border-border last:border-r-0"
                style={{ backgroundColor: hasAny ? 'var(--color-foreground)' : 'transparent' }}
              >
                <span style={{
                  ...MONO, fontSize: '9px', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  color: hasAny ? 'var(--color-background)' : 'var(--color-muted-foreground)',
                }}>
                  {DAY_SHORT[day]}
                </span>
              </div>
            )
          })}
        </div>

        {/* Filas por tipo */}
        {SESSION_TYPES.map(({ key, label, color }) => (
          <div
            key={key}
            className="grid border-b border-border last:border-b-0"
            style={{ gridTemplateColumns: '72px repeat(7, 1fr)' }}
          >
            <div className="flex items-center px-2 py-2.5 border-r border-border">
              <span style={{
                ...MONO, fontSize: '8px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.05em', color,
              }}>
                {label}
              </span>
            </div>
            {ALL_DAYS.map(day => {
              const active = isActive(day, key)
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleCell(day, key)}
                  className="flex items-center justify-center py-2.5 border-r border-border last:border-r-0 transition-all cursor-pointer focus:outline-none"
                  style={{ backgroundColor: active ? `${color}22` : 'transparent' }}
                  aria-pressed={active}
                  aria-label={`${label} el ${DAY_LABELS[day]}`}
                >
                  {active ? (
                    <span className="w-3 h-3 flex items-center justify-center" style={{ backgroundColor: color }}>
                      <svg width="7" height="5" viewBox="0 0 7 5" fill="none" aria-hidden>
                        <path d="M1 2.5L2.8 4.5L6 1" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  ) : (
                    <span className="w-3 h-3 border" style={{ borderColor: 'var(--color-border)' }} />
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Horas por día */}
      {activeDayCount > 0 && (
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-1.5">
            {ALL_DAYS.filter(d => state[d].length > 0).map(day => (
              <button
                key={day}
                type="button"
                onClick={() => setExpanded(expanded === day ? null : day)}
                className="px-2.5 py-1 border transition-all cursor-pointer focus:outline-none"
                style={{
                  ...MONO, fontSize: '9px', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  borderColor: expanded === day ? 'var(--color-foreground)' : 'var(--color-border)',
                  backgroundColor: expanded === day ? 'var(--color-foreground)' : 'transparent',
                  color: expanded === day ? 'var(--color-background)' : 'var(--color-muted-foreground)',
                }}
              >
                {DAY_SHORT[day]}
              </button>
            ))}
          </div>

          {expanded && state[expanded].length > 0 && (
            <div className="border border-border p-3 space-y-2">
              <p style={{ ...MONO, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {DAY_LABELS[expanded]}
              </p>
              {SESSION_TYPES.filter(({ key }) => isActive(expanded, key)).map(({ key, label, color }) => {
                const slots = state[expanded].filter(s => s.type === key)
                return (
                  <div key={key} className="space-y-1">
                    {slots.map((slot, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-20 text-[8px] font-bold uppercase tracking-wide" style={{ ...MONO, color }}>
                          {label}{slots.length > 1 ? ` ${i + 1}` : ''}
                        </span>
                        <input
                          type="time"
                          value={slot.time ?? ''}
                          onChange={e => setTime(expanded, key, i, e.target.value)}
                          className="focus:outline-none cursor-pointer bg-transparent"
                          style={{
                            ...MONO, fontSize: '9px', width: '60px', padding: '2px 4px',
                            border: `1px solid ${slot.time ? color : 'var(--color-border)'}`,
                            color: slot.time ? color : 'var(--color-muted-foreground)',
                          }}
                        />
                        {i > 0 && (
                          <button
                            type="button"
                            onClick={() => removeSlot(expanded, key, i)}
                            className="text-[10px] border border-border px-1 hover:border-destructive hover:text-destructive transition-colors cursor-pointer bg-transparent"
                            style={{ ...MONO, color: 'var(--color-muted-foreground)' }}
                          >×</button>
                        )}
                      </div>
                    ))}
                    {slots.length < 3 && (
                      <button
                        type="button"
                        onClick={() => addSlot(expanded, key)}
                        className="text-[8px] border border-dashed px-2 py-0.5 cursor-pointer bg-transparent transition-all hover:border-solid"
                        style={{ ...MONO, borderColor: color, color, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}
                      >+ doble sesión</button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <p className="text-center text-muted-foreground" style={{ ...MONO, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Marca las celdas para activar · las horas son opcionales
      </p>

      <button
        type="submit" disabled={isPending}
        className="w-full py-2.5 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:opacity-85 transition-opacity disabled:opacity-50 cursor-pointer"
        style={MONO}
      >
        {isPending ? 'Guardando...' : 'Guardar plantilla'}
      </button>
    </form>
  )
}
