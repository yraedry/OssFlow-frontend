import { useState } from 'react'
import { ALL_DAYS, DAY_LABELS } from '../types'
import type { DayOfWeek } from '../types'
import type { WeeklyTemplate } from '../types'
import type { SaveWeeklyTemplateForm } from '../schemas'
import { MONO } from '@/shared/lib/typography'

type SessionType = 'bjj' | 'strength' | 'cardio' | 'mobility' | 'flexibility'

const COLS: { key: SessionType; label: string; color: string }[] = [
  { key: 'bjj',         label: 'BJJ',         color: '#4a7cff' },
  { key: 'strength',    label: 'Fuerza',       color: '#f59e0b' },
  { key: 'cardio',      label: 'Cardio',       color: '#10b981' },
  { key: 'mobility',    label: 'Movilidad',    color: '#a855f7' },
  { key: 'flexibility', label: 'Flexib.',      color: '#06b6d4' },
]

type DayState = Record<SessionType, boolean>
type TimeState = Partial<Record<SessionType, string>>

function buildFromTemplate(template: WeeklyTemplate): { days: Record<DayOfWeek, DayState>; times: Record<DayOfWeek, TimeState> } {
  const map = new Map(template.days.map(d => [d.dayOfWeek, d]))
  const days = Object.fromEntries(ALL_DAYS.map(day => {
    const e = map.get(day)
    return [day, { bjj: e?.bjj ?? false, strength: e?.strength ?? false, cardio: e?.cardio ?? false, mobility: e?.mobility ?? false, flexibility: e?.flexibility ?? false }]
  })) as Record<DayOfWeek, DayState>
  const times = Object.fromEntries(ALL_DAYS.map(d => [d, {}])) as Record<DayOfWeek, TimeState>
  return { days, times }
}

function buildEmpty(): { days: Record<DayOfWeek, DayState>; times: Record<DayOfWeek, TimeState> } {
  const days = Object.fromEntries(ALL_DAYS.map(d => [d, { bjj: false, strength: false, cardio: false, mobility: false, flexibility: false }])) as Record<DayOfWeek, DayState>
  const times = Object.fromEntries(ALL_DAYS.map(d => [d, {}])) as Record<DayOfWeek, TimeState>
  return { days, times }
}

type Props = {
  template: WeeklyTemplate
  onSave: (data: SaveWeeklyTemplateForm) => void
  isPending: boolean
}

function SessionChip({ label, color, active, time, onToggle, onTimeChange }: {
  label: string
  color: string
  active: boolean
  time: string | undefined
  onToggle: () => void
  onTimeChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        onClick={onToggle}
        className="px-2 py-1 border transition-colors focus:outline-none cursor-pointer select-none"
        style={{
          ...MONO,
          fontSize: '9px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          backgroundColor: active ? color : 'transparent',
          borderColor: active ? color : 'rgba(255,255,255,0.1)',
          color: active ? '#000' : 'rgba(255,255,255,0.35)',
        }}
      >
        {label}
      </button>
      {active && (
        <input
          type="time"
          value={time ?? ''}
          onChange={e => onTimeChange(e.target.value)}
          aria-label={`Hora ${label}`}
          onClick={e => e.stopPropagation()}
          className="focus:outline-none cursor-pointer"
          style={{
            ...MONO,
            fontSize: '9px',
            width: '58px',
            padding: '3px 4px',
            backgroundColor: 'transparent',
            border: `1px solid ${time ? color : 'rgba(255,255,255,0.12)'}`,
            color: time ? color : 'rgba(255,255,255,0.25)',
            letterSpacing: '0.02em',
          }}
        />
      )}
    </div>
  )
}

export function WeeklyTemplateForm({ template, onSave, isPending }: Props) {
  const initial = template.days.length > 0 ? buildFromTemplate(template) : buildEmpty()
  const [days, setDays] = useState<Record<DayOfWeek, DayState>>(initial.days)
  const [times, setTimes] = useState<Record<DayOfWeek, TimeState>>(initial.times)

  function toggleType(day: DayOfWeek, type: SessionType) {
    const wasActive = days[day][type]
    setDays(prev => ({ ...prev, [day]: { ...prev[day], [type]: !wasActive } }))
    if (wasActive) {
      setTimes(prev => {
        const next = { ...prev[day] }
        delete next[type]
        return { ...prev, [day]: next }
      })
    }
  }

  function setTime(day: DayOfWeek, type: SessionType, value: string) {
    setTimes(prev => ({ ...prev, [day]: { ...prev[day], [type]: value || undefined } }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      days: ALL_DAYS.map(day => ({
        dayOfWeek: day,
        bjj: days[day].bjj,
        strength: days[day].strength,
        cardio: days[day].cardio,
        mobility: days[day].mobility,
        flexibility: days[day].flexibility,
      })),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-border divide-y divide-border">
        {ALL_DAYS.map(day => {
          const dayActive = COLS.some(c => days[day][c.key])
          return (
            <div
              key={day}
              className="flex items-start gap-3 px-3 py-2.5 hover:bg-accent/10 transition-colors"
              style={{ opacity: dayActive ? 1 : 0.45 }}
            >
              <span
                className="w-[62px] shrink-0 pt-0.5"
                style={{ ...MONO, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}
              >
                {DAY_LABELS[day]}
              </span>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {COLS.map(col => (
                  <SessionChip
                    key={col.key}
                    label={col.label}
                    color={col.color}
                    active={days[day][col.key]}
                    time={times[day][col.key]}
                    onToggle={() => toggleType(day, col.key)}
                    onTimeChange={v => setTime(day, col.key, v)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-center" style={{ ...MONO, fontSize: '8px', color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Pulsa un tipo para activarlo · la hora es opcional
      </p>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:opacity-85 transition-opacity disabled:opacity-50 cursor-pointer"
        style={MONO}
      >
        {isPending ? 'Guardando...' : 'Guardar plantilla'}
      </button>
    </form>
  )
}
