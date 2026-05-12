import { useState } from 'react'
import { ALL_DAYS, DAY_LABELS } from '../types'
import type { DayOfWeek, SessionType, WeeklyTemplate } from '../types'
import type { SaveWeeklyTemplateForm } from '../schemas'
import { MONO } from '@/shared/lib/typography'

const COLS: { key: SessionType; label: string; color: string }[] = [
  { key: 'BJJ',         label: 'BJJ',         color: '#4a7cff' },
  { key: 'STRENGTH',    label: 'Fuerza',       color: '#f59e0b' },
  { key: 'CARDIO',      label: 'Cardio',       color: '#10b981' },
  { key: 'MOBILITY',    label: 'Movilidad',    color: '#a855f7' },
  { key: 'FLEXIBILITY', label: 'Flexib.',      color: '#06b6d4' },
]

type DaySlots = { type: SessionType; time?: string }[]
type State = Record<DayOfWeek, DaySlots>

function buildFromTemplate(template: WeeklyTemplate): State {
  const base = Object.fromEntries(ALL_DAYS.map(d => [d, []])) as State
  for (const day of template.days) {
    base[day.dayOfWeek] = day.sessions.map(s => ({ type: s.type, time: s.time }))
  }
  return base
}

function buildEmpty(): State {
  return Object.fromEntries(ALL_DAYS.map(d => [d, []])) as State
}

type Props = {
  template: WeeklyTemplate
  onSave: (data: SaveWeeklyTemplateForm) => void
  isPending: boolean
}

function SessionChip({ label, color, active, time, onToggle, onTimeChange, onAdd }: {
  label: string; color: string; active: boolean; time?: string
  onToggle: () => void; onTimeChange: (v: string) => void; onAdd: () => void
}) {
  return (
    <div className="flex items-center gap-0.5">
      <button type="button" onClick={onToggle}
        className="px-2 py-1 border transition-colors focus:outline-none cursor-pointer select-none"
        style={{ ...MONO, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
          backgroundColor: active ? color : 'transparent',
          borderColor: active ? color : 'rgba(255,255,255,0.1)',
          color: active ? '#000' : 'rgba(255,255,255,0.35)' }}
      >{label}</button>
      {active && (
        <>
          <input type="time" value={time ?? ''} onChange={e => onTimeChange(e.target.value)}
            aria-label={`Hora ${label}`} onClick={e => e.stopPropagation()}
            className="focus:outline-none cursor-pointer"
            style={{ ...MONO, fontSize: '9px', width: '58px', padding: '3px 4px',
              backgroundColor: 'transparent',
              border: `1px solid ${time ? color : 'rgba(255,255,255,0.12)'}`,
              color: time ? color : 'rgba(255,255,255,0.25)', letterSpacing: '0.02em' }} />
          <button type="button" onClick={e => { e.stopPropagation(); onAdd() }}
            aria-label={`Añadir otra sesión de ${label}`}
            className="px-1 border transition-colors focus:outline-none cursor-pointer"
            style={{ ...MONO, fontSize: '9px', borderColor: 'rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.3)', backgroundColor: 'transparent' }}>+</button>
        </>
      )}
    </div>
  )
}

function ExtraChip({ label, color, time, onTimeChange, onRemove }: {
  label: string; color: string; time?: string
  onTimeChange: (v: string) => void; onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-0.5">
      <span className="px-2 py-1 border" style={{ ...MONO, fontSize: '9px', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        backgroundColor: color, borderColor: color, color: '#000' }}>{label}</span>
      <input type="time" value={time ?? ''} onChange={e => onTimeChange(e.target.value)}
        aria-label={`Hora ${label}`} className="focus:outline-none cursor-pointer"
        style={{ ...MONO, fontSize: '9px', width: '58px', padding: '3px 4px',
          backgroundColor: 'transparent',
          border: `1px solid ${time ? color : 'rgba(255,255,255,0.12)'}`,
          color: time ? color : 'rgba(255,255,255,0.25)', letterSpacing: '0.02em' }} />
      <button type="button" onClick={onRemove} aria-label="Eliminar sesión"
        className="px-1 border focus:outline-none cursor-pointer"
        style={{ ...MONO, fontSize: '9px', borderColor: 'rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.3)', backgroundColor: 'transparent' }}>×</button>
    </div>
  )
}

export function WeeklyTemplateForm({ template, onSave, isPending }: Props) {
  const [state, setState] = useState<State>(() =>
    template.days.length > 0 ? buildFromTemplate(template) : buildEmpty()
  )

  function isActive(day: DayOfWeek, type: SessionType) {
    return state[day].some(s => s.type === type)
  }

  function getFirstSlot(day: DayOfWeek, type: SessionType) {
    return state[day].find(s => s.type === type)
  }

  function toggleType(day: DayOfWeek, type: SessionType) {
    setState(prev => {
      const slots = prev[day]
      if (slots.some(s => s.type === type)) {
        return { ...prev, [day]: slots.filter(s => s.type !== type) }
      }
      return { ...prev, [day]: [...slots, { type }] }
    })
  }

  function setTime(day: DayOfWeek, type: SessionType, slotIndex: number, value: string) {
    setState(prev => {
      const slots = [...prev[day]]
      const realIdx = prev[day].reduce<number[]>((acc, s, i) => s.type === type ? [...acc, i] : acc, [])[slotIndex]
      slots[realIdx] = { ...slots[realIdx], time: value || undefined }
      return { ...prev, [day]: slots }
    })
  }

  function addSlot(day: DayOfWeek, type: SessionType) {
    setState(prev => ({ ...prev, [day]: [...prev[day], { type }] }))
  }

  function removeSlot(day: DayOfWeek, type: SessionType, slotIndex: number) {
    setState(prev => {
      let count = -1
      const slots = prev[day].filter(s => {
        if (s.type === type) { count++; return count !== slotIndex }
        return true
      })
      return { ...prev, [day]: slots }
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-border divide-y divide-border">
        {ALL_DAYS.map(day => {
          const dayActive = state[day].length > 0
          return (
            <div key={day} className="flex items-start gap-3 px-3 py-2.5 hover:bg-accent/10 transition-colors"
              style={{ opacity: dayActive ? 1 : 0.45 }}>
              <span className="w-[62px] shrink-0 pt-0.5"
                style={{ ...MONO, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {DAY_LABELS[day]}
              </span>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {COLS.map(col => {
                  const active = isActive(day, col.key)
                  const firstSlot = getFirstSlot(day, col.key)
                  const extraSlots = state[day].filter(s => s.type === col.key).slice(1)
                  return (
                    <div key={col.key} className="flex flex-wrap gap-1">
                      <SessionChip
                        label={col.label} color={col.color} active={active} time={firstSlot?.time}
                        onToggle={() => toggleType(day, col.key)}
                        onTimeChange={v => setTime(day, col.key, 0, v)}
                        onAdd={() => addSlot(day, col.key)}
                      />
                      {extraSlots.map((slot, i) => (
                        <ExtraChip key={i} label={col.label} color={col.color} time={slot.time}
                          onTimeChange={v => setTime(day, col.key, i + 1, v)}
                          onRemove={() => removeSlot(day, col.key, i + 1)} />
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-center" style={{ ...MONO, fontSize: '8px', color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Pulsa un tipo para activarlo · + para añadir doble sesión · la hora es opcional
      </p>

      <button type="submit" disabled={isPending}
        className="w-full py-2.5 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:opacity-85 transition-opacity disabled:opacity-50 cursor-pointer"
        style={MONO}>
        {isPending ? 'Guardando...' : 'Guardar plantilla'}
      </button>
    </form>
  )
}
