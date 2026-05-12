import { useState } from 'react'
import { ALL_DAYS, DAY_LABELS } from '@/features/planning/weeklytemplate/types'
import type { DayOfWeek, SessionType } from '@/features/planning/weeklytemplate/types'
import type { SaveWeeklyTemplateForm } from '@/features/planning/weeklytemplate/schemas'
import { MONO } from '@/shared/lib/typography'

const COLS: { key: SessionType; label: string; color: string }[] = [
  { key: 'BJJ',         label: 'BJJ',      color: '#4a7cff' },
  { key: 'STRENGTH',    label: 'Fuerza',   color: '#f59e0b' },
  { key: 'CARDIO',      label: 'Cardio',   color: '#10b981' },
  { key: 'MOBILITY',    label: 'Movil.',   color: '#a855f7' },
  { key: 'FLEXIBILITY', label: 'Flexib.',  color: '#06b6d4' },
]

type DaySlots = { type: SessionType; time?: string }[]
type State = Record<DayOfWeek, DaySlots>

function buildEmpty(): State {
  return ALL_DAYS.reduce<State>((acc, d) => { acc[d] = []; return acc }, {} as State)
}

type Props = {
  onNext: (data: SaveWeeklyTemplateForm | null) => void
  onBack: () => void
}

function SessionChip({ label, color, active, time, onToggle, onTimeChange, onAdd }: {
  label: string; color: string; active: boolean; time?: string
  onToggle: () => void; onTimeChange: (v: string) => void; onAdd: () => void
}) {
  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        onClick={onToggle}
        className="px-2 py-1 border transition-all focus:outline-none cursor-pointer select-none"
        style={{
          ...MONO, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
          backgroundColor: active ? color : 'transparent',
          borderColor: active ? color : 'var(--color-border)',
          color: active ? '#fff' : 'var(--color-muted-foreground)',
        }}
      >{label}</button>
      {active && (
        <>
          <input
            type="time" value={time ?? ''} onChange={e => onTimeChange(e.target.value)}
            aria-label={`Hora ${label}`} onClick={e => e.stopPropagation()}
            className="focus:outline-none cursor-pointer bg-transparent"
            style={{
              ...MONO, fontSize: '9px', width: '58px', padding: '3px 4px',
              border: `1px solid ${time ? color : 'var(--color-border)'}`,
              color: time ? color : 'var(--color-muted-foreground)',
              letterSpacing: '0.02em',
            }}
          />
          <button
            type="button" onClick={e => { e.stopPropagation(); onAdd() }}
            aria-label={`Añadir otra sesión de ${label}`}
            className="px-1 border focus:outline-none cursor-pointer bg-transparent transition-colors hover:bg-accent"
            style={{ ...MONO, fontSize: '11px', borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}
          >+</button>
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
      <span
        className="px-2 py-1 border"
        style={{ ...MONO, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
          backgroundColor: color, borderColor: color, color: '#fff' }}
      >{label}</span>
      <input
        type="time" value={time ?? ''} onChange={e => onTimeChange(e.target.value)}
        aria-label={`Hora ${label}`} onClick={e => e.stopPropagation()}
        className="focus:outline-none cursor-pointer bg-transparent"
        style={{
          ...MONO, fontSize: '9px', width: '58px', padding: '3px 4px',
          border: `1px solid ${time ? color : 'var(--color-border)'}`,
          color: time ? color : 'var(--color-muted-foreground)',
          letterSpacing: '0.02em',
        }}
      />
      <button
        type="button" onClick={e => { e.stopPropagation(); onRemove() }}
        aria-label="Eliminar sesión"
        className="px-1 border focus:outline-none cursor-pointer bg-transparent transition-colors hover:bg-destructive/10"
        style={{ ...MONO, fontSize: '11px', borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}
      >×</button>
    </div>
  )
}

export function WeeklyTemplateStep({ onNext, onBack }: Props) {
  const [state, setState] = useState<State>(buildEmpty)

  function getFirstSlot(day: DayOfWeek, type: SessionType) {
    return state[day].find(s => s.type === type)
  }

  function isActive(day: DayOfWeek, type: SessionType) {
    return state[day].some(s => s.type === type)
  }

  function toggleType(day: DayOfWeek, type: SessionType) {
    setState(prev => {
      const slots = prev[day]
      const idx = slots.findIndex(s => s.type === type)
      if (idx >= 0) {
        return { ...prev, [day]: slots.filter(s => s.type !== type) }
      } else {
        return { ...prev, [day]: [...slots, { type }] }
      }
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

  function handleNext() {
    const anyActive = ALL_DAYS.some(d => state[d].length > 0)
    if (!anyActive) { onNext(null); return }
    onNext({
      days: ALL_DAYS
        .filter(day => state[day].length > 0)
        .map(day => ({ dayOfWeek: day, sessions: state[day].map(s => ({ type: s.type, time: s.time })) })),
    })
  }

  return (
    <div className="space-y-4">
      <div className="border border-border divide-y divide-border">
        {ALL_DAYS.map(day => {
          const dayActive = state[day].length > 0
          return (
            <div
              key={day}
              className="flex items-start gap-3 px-3 py-2.5 hover:bg-accent/30 transition-colors"
            >
              <span
                className="w-[62px] shrink-0 pt-1"
                style={{
                  ...MONO, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: dayActive ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
                }}
              >
                {DAY_LABELS[day]}
              </span>
              <div className="flex flex-wrap gap-1.5 flex-1 min-h-[28px] items-center">
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

      <p
        className="text-center text-muted-foreground"
        style={{ ...MONO, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}
      >
        Pulsa un tipo para activarlo · + para añadir doble sesión · la hora es opcional
      </p>

      <div className="flex gap-3">
        <button
          type="button" onClick={onBack}
          className="flex-1 py-2.5 border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors cursor-pointer"
          style={MONO}
        >Atrás</button>
        <button
          type="button" onClick={handleNext}
          className="flex-[2] py-2.5 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:opacity-85 transition-opacity cursor-pointer"
          style={MONO}
        >Siguiente</button>
      </div>
      <button
        type="button" onClick={() => onNext(null)}
        className="w-full text-center text-[9px] uppercase tracking-widest text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors cursor-pointer"
        style={MONO}
      >Saltar este paso</button>
    </div>
  )
}
