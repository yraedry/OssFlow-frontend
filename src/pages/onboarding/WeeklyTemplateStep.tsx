import { useState } from 'react'
import { ALL_DAYS, DAY_LABELS } from '@/features/planning/weeklytemplate/types'
import type { DayOfWeek } from '@/features/planning/weeklytemplate/types'
import type { SaveWeeklyTemplateForm } from '@/features/planning/weeklytemplate/schemas'
import { MONO, SERIF } from '@/shared/lib/typography'

type SessionType = 'bjj' | 'strength' | 'cardio' | 'mobility' | 'flexibility'

const COLS: { key: SessionType; label: string; short: string; color: string }[] = [
  { key: 'bjj',         label: 'BJJ',          short: 'BJJ',    color: '#4a7cff' },
  { key: 'strength',    label: 'Fuerza',        short: 'Fza',    color: '#f59e0b' },
  { key: 'cardio',      label: 'Cardio',        short: 'Card',   color: '#10b981' },
  { key: 'mobility',    label: 'Movilidad',     short: 'Mov',    color: '#a855f7' },
  { key: 'flexibility', label: 'Flexibilidad',  short: 'Flex',   color: '#06b6d4' },
]

type DayState = Record<SessionType, boolean>
type TimeState = Partial<Record<SessionType, string>>

function buildEmpty(): DayState {
  return { bjj: false, strength: false, cardio: false, mobility: false, flexibility: false }
}

type Props = {
  onNext: (data: SaveWeeklyTemplateForm | null) => void
  onBack: () => void
}

function Toggle({ active, color, onClick }: { active: boolean; color: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={active}
      onClick={onClick}
      className="w-8 h-[18px] relative border transition-colors focus:outline-none cursor-pointer"
      style={{
        backgroundColor: active ? color : 'transparent',
        borderColor: active ? color : 'rgba(255,255,255,0.12)',
      }}
    >
      <span
        className="absolute top-[2px] w-[11px] h-[11px] transition-transform"
        style={{
          backgroundColor: active ? '#fff' : 'rgba(255,255,255,0.2)',
          transform: active ? 'translateX(17px)' : 'translateX(2px)',
        }}
      />
    </button>
  )
}

function TimeChip({ color, value, onChange }: { color: string; value: string | undefined; onChange: (v: string) => void }) {
  const hasTime = !!value
  return (
    <input
      type="time"
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      aria-label="Hora de sesión (opcional)"
      className="border text-center transition-colors focus:outline-none cursor-pointer"
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '8px',
        padding: '2px 4px',
        width: '52px',
        backgroundColor: 'transparent',
        color: hasTime ? color : 'rgba(255,255,255,0.3)',
        borderColor: hasTime ? color : 'rgba(255,255,255,0.08)',
        letterSpacing: '0.04em',
      }}
    />
  )
}

export function WeeklyTemplateStep({ onNext, onBack }: Props) {
  const [days, setDays] = useState<Record<DayOfWeek, DayState>>(
    () => Object.fromEntries(ALL_DAYS.map(d => [d, buildEmpty()])) as Record<DayOfWeek, DayState>
  )
  const [times, setTimes] = useState<Record<DayOfWeek, TimeState>>(
    () => Object.fromEntries(ALL_DAYS.map(d => [d, {}])) as Record<DayOfWeek, TimeState>
  )

  function toggleType(day: DayOfWeek, type: SessionType) {
    setDays(prev => ({
      ...prev,
      [day]: { ...prev[day], [type]: !prev[day][type] },
    }))
    // limpiar hora si se desactiva
    if (days[day][type]) {
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

  function handleNext() {
    const anyActive = ALL_DAYS.some(d => Object.values(days[d]).some(Boolean))
    if (!anyActive) { onNext(null); return }
    const form: SaveWeeklyTemplateForm = {
      days: ALL_DAYS.map(day => ({
        dayOfWeek: day,
        bjj: days[day].bjj,
        strength: days[day].strength,
        cardio: days[day].cardio,
        mobility: days[day].mobility,
        flexibility: days[day].flexibility,
      })),
    }
    onNext(form)
  }

  return (
    <div className="space-y-5">
      {/* Leyenda */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center">
        {COLS.map(c => (
          <div key={c.key} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 flex-shrink-0" style={{ backgroundColor: c.color }} />
            <span className="text-[8px] uppercase tracking-widest" style={{ ...MONO, color: c.color }}>{c.label}</span>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="border border-border">
        {/* Header */}
        <div className="grid border-b border-border bg-muted/30" style={{ gridTemplateColumns: '82px repeat(5, 1fr)' }}>
          <div className="py-2.5 px-3.5" style={{ ...MONO, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted-foreground)' }}>
            Día
          </div>
          {COLS.map(c => (
            <div key={c.key} className="py-2.5 px-1 text-center" style={{ ...MONO, fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.08em', color: c.color, fontWeight: 700 }}>
              {c.short}
            </div>
          ))}
        </div>

        {/* Rows */}
        {ALL_DAYS.map(day => {
          const dayActive = Object.values(days[day]).some(Boolean)
          return (
            <div
              key={day}
              className="border-b border-border last:border-b-0 hover:bg-accent/20 transition-colors"
              style={{ opacity: dayActive ? 1 : 0.55 }}
            >
              <div className="grid items-center" style={{ gridTemplateColumns: '82px repeat(5, 1fr)' }}>
                <div className="py-3 px-3.5" style={{ ...MONO, fontSize: '11px', fontWeight: 600 }}>
                  {DAY_LABELS[day]}
                </div>
                {COLS.map(col => (
                  <div key={col.key} className="py-2 px-1 flex flex-col items-center gap-1.5">
                    <Toggle
                      active={days[day][col.key]}
                      color={col.color}
                      onClick={() => toggleType(day, col.key)}
                    />
                    {days[day][col.key] && (
                      <TimeChip
                        color={col.color}
                        value={times[day][col.key]}
                        onChange={v => setTime(day, col.key, v)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-center" style={{ ...MONO, fontSize: '8px', color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        La hora es opcional · Editable después en Planificación
      </p>

      <div className="flex gap-3">
        <button type="button" onClick={onBack}
          className="flex-1 py-2.5 border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors cursor-pointer"
          style={MONO}>
          Atrás
        </button>
        <button type="button" onClick={handleNext}
          className="flex-[2] py-2.5 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:opacity-85 transition-opacity cursor-pointer"
          style={MONO}>
          Siguiente
        </button>
      </div>
      <button
        type="button"
        onClick={() => onNext(null)}
        className="w-full text-center text-[9px] uppercase tracking-widest text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors cursor-pointer"
        style={MONO}
      >
        Saltar este paso
      </button>
    </div>
  )
}
