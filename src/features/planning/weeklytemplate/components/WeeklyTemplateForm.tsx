import { useState } from 'react'
import { ALL_DAYS, DAY_LABELS } from '../types'
import type { DayOfWeek, SessionType, WeeklyTemplate } from '../types'
import type { SaveWeeklyTemplateForm } from '../schemas'
import { MONO } from '@/shared/lib/typography'

const SESSION_TYPES: { key: SessionType; label: string; short: string; color: string }[] = [
  { key: 'BJJ',         label: 'BJJ',         short: 'BJJ',   color: '#4a7cff' },
  { key: 'STRENGTH',    label: 'Fuerza',       short: 'Fuerza', color: '#f59e0b' },
  { key: 'CARDIO',      label: 'Cardio',       short: 'Cardio', color: '#10b981' },
  { key: 'MOBILITY',    label: 'Movilidad',    short: 'Movil.', color: '#a855f7' },
  { key: 'FLEXIBILITY', label: 'Flexibilidad', short: 'Flex.',  color: '#06b6d4' },
]

const DAY_SHORT: Record<DayOfWeek, string> = {
  MONDAY: 'Lun', TUESDAY: 'Mar', WEDNESDAY: 'Mié',
  THURSDAY: 'Jue', FRIDAY: 'Vie', SATURDAY: 'Sáb', SUNDAY: 'Dom',
}

const DAY_LETTER: Record<DayOfWeek, string> = {
  MONDAY: 'L', TUESDAY: 'M', WEDNESDAY: 'X',
  THURSDAY: 'J', FRIDAY: 'V', SATURDAY: 'S', SUNDAY: 'D',
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

function TimeInput({ value, onChange, color }: { value: string; onChange: (v: string) => void; color: string }) {
  const [hh, mm] = value ? value.split(':') : ['', '']

  function handlePart(part: 'hh' | 'mm', raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 2)
    const newHh = part === 'hh' ? digits : (hh || '')
    const newMm = part === 'mm' ? digits : (mm || '')
    if (!newHh && !newMm) { onChange(''); return }
    onChange(`${newHh.padStart(2, '0')}:${newMm.padStart(2, '0')}`)
  }

  const hasValue = !!value
  const borderColor = hasValue ? color : 'var(--color-border)'
  const textColor = hasValue ? color : 'var(--color-muted-foreground)'

  return (
    <div
      className="flex items-center gap-0.5"
      style={{ border: `1px solid ${borderColor}`, padding: '3px 6px', ...MONO, fontSize: '11px', color: textColor }}
    >
      <input
        type="text"
        inputMode="numeric"
        placeholder="--"
        value={hh}
        onChange={e => handlePart('hh', e.target.value)}
        className="bg-transparent focus:outline-none text-center"
        style={{ width: '18px', color: textColor, ...MONO, fontSize: '11px' }}
        maxLength={2}
      />
      <span style={{ color: textColor }}>:</span>
      <input
        type="text"
        inputMode="numeric"
        placeholder="--"
        value={mm}
        onChange={e => handlePart('mm', e.target.value)}
        className="bg-transparent focus:outline-none text-center"
        style={{ width: '18px', color: textColor, ...MONO, fontSize: '11px' }}
        maxLength={2}
      />
    </div>
  )
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

  const activeDays = ALL_DAYS.filter(d => state[d].length > 0)

  return (
    <form onSubmit={handleSubmit} className="space-y-3">

      {/* Tabla semanal — sin scroll, cabe en cualquier móvil */}
      <div className="border border-border overflow-hidden">
        {/* Header: días */}
        <div className="grid border-b border-border" style={{ gridTemplateColumns: 'minmax(72px, auto) repeat(7, 1fr)' }}>
          <div className="border-r border-border" />
          {ALL_DAYS.map(day => {
            const hasAny = state[day].length > 0
            return (
              <div
                key={day}
                className="flex items-center justify-center py-2 border-r border-border last:border-r-0"
                style={{ backgroundColor: hasAny ? 'var(--color-foreground)' : 'transparent' }}
              >
                <span className="sm:hidden" style={{
                  ...MONO, fontSize: '10px', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                  color: hasAny ? 'var(--color-background)' : 'var(--color-muted-foreground)',
                }}>
                  {DAY_LETTER[day]}
                </span>
                <span className="hidden sm:block" style={{
                  ...MONO, fontSize: '11px', fontWeight: 700,
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
        {SESSION_TYPES.map(({ key, label, short, color }) => (
          <div
            key={key}
            className="grid border-b border-border last:border-b-0"
            style={{ gridTemplateColumns: 'minmax(72px, auto) repeat(7, 1fr)' }}
          >
            <div className="flex items-center px-2 py-3 border-r border-border sm:px-4">
              <span className="sm:hidden leading-tight" style={{
                ...MONO, fontSize: '9px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.02em', color,
              }}>
                {short}
              </span>
              <span className="hidden sm:block leading-tight whitespace-nowrap" style={{
                ...MONO, fontSize: '10px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.03em', color,
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
                    className="flex items-center justify-center py-4 border-r border-border last:border-r-0 transition-all cursor-pointer focus:outline-none hover:bg-accent/20"
                    style={{ backgroundColor: active ? `${color}18` : 'transparent' }}
                    aria-pressed={active}
                    aria-label={`${label} el ${DAY_LABELS[day]}`}
                  >
                    {active ? (
                      <span className="w-5 h-5 flex items-center justify-center" style={{ backgroundColor: color }}>
                        <svg width="10" height="7" viewBox="0 0 10 7" fill="none" aria-hidden>
                          <path d="M1 3.5L3.8 6L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    ) : (
                      <span className="w-5 h-5 border-2" style={{ borderColor: 'var(--color-border)' }} />
                    )}
                  </button>
                )
              })}
          </div>
        ))}
      </div>

      {/* Horas por día */}
      {activeDays.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-muted-foreground" style={{ ...MONO, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Horas opcionales — pulsa un día para configurarlas
          </p>
          <div className="flex flex-wrap gap-1.5">
            {activeDays.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => setExpanded(expanded === day ? null : day)}
                className="px-2.5 py-1 border transition-all cursor-pointer focus:outline-none"
                style={{
                  ...MONO, fontSize: '10px', fontWeight: 700,
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
            <div className="border border-border p-4 space-y-3">
              <p style={{ ...MONO, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {DAY_LABELS[expanded]}
              </p>
              {SESSION_TYPES.filter(({ key }) => isActive(expanded, key)).map(({ key, label, color }) => {
                const slots = state[expanded].filter(s => s.type === key)
                return (
                  <div key={key} className="space-y-1.5">
                    {slots.map((slot, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-24 text-[10px] font-bold uppercase tracking-wide" style={{ ...MONO, color }}>
                          {label}{slots.length > 1 ? ` ${i + 1}` : ''}
                        </span>
                        <TimeInput
                          value={slot.time ?? ''}
                          onChange={v => setTime(expanded, key, i, v)}
                          color={color}
                        />
                        {i > 0 && (
                          <button
                            type="button"
                            onClick={() => removeSlot(expanded, key, i)}
                            className="text-xs border border-border px-1.5 py-0.5 hover:border-destructive hover:text-destructive transition-colors cursor-pointer bg-transparent"
                            style={{ ...MONO, color: 'var(--color-muted-foreground)' }}
                          >×</button>
                        )}
                      </div>
                    ))}
                    {slots.length < 3 && (
                      <button
                        type="button"
                        onClick={() => addSlot(expanded, key)}
                        className="text-[9px] border border-dashed px-2.5 py-1 cursor-pointer bg-transparent transition-all hover:border-solid"
                        style={{ ...MONO, borderColor: color, color, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}
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
        className="w-full py-3 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:opacity-85 transition-opacity disabled:opacity-50 cursor-pointer"
        style={MONO}
      >
        {isPending ? 'Guardando...' : 'Guardar plantilla'}
      </button>
    </form>
  )
}
