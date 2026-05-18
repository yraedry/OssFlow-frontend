import { useState } from 'react'
import { Key, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { AthleteRoster } from '../components/AthleteRoster'
import { useAthletes } from '../hooks'
import { GymTab } from '../gym/GymTab'
import { ClassPlanTab } from '../classplan/ClassPlanTab'

type Tab = 'alumnos' | 'planificacion' | 'gimnasios'

const MONO = { fontFamily: 'var(--font-mono)' } as const

function AthletesCount() {
  const { data: athletes } = useAthletes()
  const count = athletes?.length ?? 0
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground" style={MONO}>
      <Users className="h-3 w-3" strokeWidth={1.5} />
      {count} alumno{count !== 1 ? 's' : ''}
    </span>
  )
}

export function GymDashboardPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('alumnos')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'alumnos',        label: 'Alumnos' },
    { id: 'planificacion',  label: 'Planificación' },
    { id: 'gimnasios',      label: 'Mis gimnasios' },
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 border border-border bg-card px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            Coaching
          </p>
          <h1 className="font-serif text-[clamp(22px,3vw,30px)] font-black leading-none tracking-tight text-foreground">
            Gimnasio
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <AthletesCount />
          <Link
            to="/configuracion#invitation"
            className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-xs font-mono font-bold uppercase tracking-wide hover:opacity-85 transition-opacity shrink-0 cursor-pointer"
          >
            <Key className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
            <span className="hidden sm:inline">Código de invitación</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wide border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'alumnos' && (
          <AthleteRoster onSelectAthlete={(id) => navigate(`/gimnasio/atletas/${id}`)} />
        )}
        {activeTab === 'planificacion' && <ClassPlanTab />}
        {activeTab === 'gimnasios' && <GymTab />}
      </div>
    </div>
  )
}
