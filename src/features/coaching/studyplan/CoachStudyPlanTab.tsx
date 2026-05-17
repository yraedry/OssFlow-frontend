import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useConfirm } from '@/shared/hooks/useConfirm'
import { useCoachStudyPlans, useCreateStudyPlan, useDeleteStudyPlan, useDuplicatePlan } from './hooks'
import { useAthletes } from '@/features/coaching/hooks'
import { StudyPlanEditor } from './StudyPlanEditor'
import { Spinner } from '@/shared/components/ui/spinner'
import type { StudyPlan } from './types'
import type { CoachAthleteListItem } from '@/features/coaching/types'

interface Props {
  athleteId: number
}

export function CoachStudyPlanTab({ athleteId }: Props) {
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [copyModalPlanId, setCopyModalPlanId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(() => {
    return (localStorage.getItem('studyplan-view') as 'cards' | 'table') ?? 'cards'
  })
  const confirm = useConfirm()

  const { data: plans, isLoading } = useCoachStudyPlans(athleteId)
  const { data: athletes } = useAthletes()
  const create = useCreateStudyPlan(athleteId)
  const deletePlan = useDeleteStudyPlan(athleteId)
  const duplicatePlan = useDuplicatePlan(athleteId)

  if (editingPlanId) {
    return (
      <StudyPlanEditor
        planId={editingPlanId}
        athleteId={athleteId}
        onBack={() => setEditingPlanId(null)}
      />
    )
  }

  async function handleCreate() {
    if (!newTitle.trim()) return
    const plan = await create.mutateAsync(newTitle.trim())
    setNewTitle('')
    setCreating(false)
    setEditingPlanId(plan.id)
  }

  async function handleDelete(plan: StudyPlan) {
    const ok = await confirm({ description: `¿Eliminar el plan "${plan.title}"?` })
    if (!ok) return
    deletePlan.mutate(plan.id)
  }

  function handleNewPlanCard() {
    setCreating(true)
  }

  function toggleView() {
    const next = viewMode === 'cards' ? 'table' : 'cards'
    setViewMode(next)
    localStorage.setItem('studyplan-view', next)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', margin: 0 }}>
          Planes de estudio
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={toggleView}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em',
              border: '1px solid #3a3a3a', padding: '6px 12px', background: 'transparent', color: '#888', cursor: 'pointer',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f0ebe3'; (e.currentTarget as HTMLElement).style.borderColor = '#888' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#888'; (e.currentTarget as HTMLElement).style.borderColor = '#3a3a3a' }}
          >
            {viewMode === 'cards' ? '≡ Tabla' : '⊞ Tarjetas'}
          </button>
          <button
            type="button"
            onClick={() => setCreating(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em',
              border: '1px solid #3a3a3a', padding: '6px 12px', background: 'transparent', color: '#888', cursor: 'pointer',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f0ebe3'; (e.currentTarget as HTMLElement).style.borderColor = '#888' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#888'; (e.currentTarget as HTMLElement).style.borderColor = '#3a3a3a' }}
          >
            <Plus style={{ width: 12, height: 12 }} strokeWidth={1.5} />
            Nuevo plan
          </button>
        </div>
      </div>

      {/* Create form */}
      {creating && (
        <div style={{ display: 'flex', gap: 8, border: '1px solid #3a3a3a', padding: 12, background: '#1a1a1a' }}>
          <input
            autoFocus
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleCreate()
              if (e.key === 'Escape') { setCreating(false); setNewTitle('') }
            }}
            placeholder="Título del plan..."
            style={{
              flex: 1, background: 'transparent', color: '#f0ebe3', fontSize: 13,
              border: 'none', borderBottom: '1px solid #3a3a3a', outline: 'none', paddingBottom: 4,
              fontFamily: 'var(--font-mono)',
            }}
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={!newTitle.trim() || create.isPending}
            style={{
              padding: '4px 12px', fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase',
              background: '#f0ebe3', color: '#0f0f0f', border: 'none', cursor: 'pointer', opacity: (!newTitle.trim() || create.isPending) ? 0.5 : 1,
            }}
          >
            {create.isPending ? <Spinner /> : 'Crear'}
          </button>
          <button
            type="button"
            onClick={() => { setCreating(false); setNewTitle('') }}
            style={{
              padding: '4px 8px', fontFamily: 'var(--font-mono)', fontSize: 10,
              border: '1px solid #3a3a3a', background: 'transparent', color: '#888', cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Plan list */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
          <Spinner />
        </div>
      ) : viewMode === 'table' ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
              {['Título', 'Estado', 'Fecha', 'Bloques', ''].map(h => (
                <th key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', padding: '6px 16px', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(plans ?? []).map(plan => (
              <tr
                key={plan.id}
                onClick={() => setEditingPlanId(plan.id)}
                style={{ borderBottom: '1px solid #2a2a2a', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#1e1e1e')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#f0ebe3', padding: '10px 16px', fontWeight: 500 }}>{plan.title}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: plan.status === 'PUBLISHED' ? '#22c55e' : '#555', padding: '10px 16px' }}>
                  {plan.status === 'PUBLISHED' ? 'Publicado' : 'Borrador'}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#888', padding: '10px 16px' }}>
                  {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '—'}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#888', padding: '10px 16px' }}>
                  {(plan.blocks ?? []).length}
                </td>
                <td style={{ padding: '10px 16px', textAlign: 'right', whiteSpace: 'nowrap' }} onClick={e => e.stopPropagation()}>
                  <button
                    title="Duplicar"
                    onClick={() => duplicatePlan.mutate({ planId: plan.id, targetAthleteId: athleteId })}
                    style={{ color: '#555', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginRight: 6 }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#f0ebe3')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#555')}
                  >
                    ⧉
                  </button>
                  <button
                    title="Copiar a otro atleta"
                    onClick={() => setCopyModalPlanId(plan.id)}
                    style={{ color: '#555', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginRight: 6 }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#f0ebe3')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#555')}
                  >
                    →
                  </button>
                  <button
                    onClick={() => handleDelete(plan)}
                    style={{ color: '#555', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#ef4444')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#555')}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#2a2a2a' }}>
          {(plans ?? []).map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={() => setEditingPlanId(plan.id)}
              onDelete={() => handleDelete(plan)}
              onDuplicate={() => duplicatePlan.mutate({ planId: plan.id, targetAthleteId: athleteId })}
              onCopyToAthlete={() => setCopyModalPlanId(plan.id)}
            />
          ))}

          {/* Empty add card */}
          <div
            onClick={handleNewPlanCard}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleNewPlanCard() }}
            style={{
              border: '1px dashed #333', padding: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#555', minHeight: 120, background: 'transparent',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLElement).style.borderColor = '#666'
              ;(e.currentTarget as HTMLElement).style.color = '#f0ebe3'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLElement).style.borderColor = '#333'
              ;(e.currentTarget as HTMLElement).style.color = '#555'
            }}
          >
            ＋ NUEVO PLAN
          </div>
        </div>
      )}

      {/* Copy to athlete modal */}
      {copyModalPlanId !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1a1a1a', border: '1px solid #3a3a3a', padding: 24, minWidth: 300 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: 16 }}>
              Copiar a atleta
            </div>
            {(athletes as CoachAthleteListItem[] | undefined)?.filter(a => a.athleteId !== athleteId).map(a => (
              <button
                key={a.athleteId}
                onClick={() => {
                  duplicatePlan.mutate({ planId: copyModalPlanId, targetAthleteId: a.athleteId })
                  setCopyModalPlanId(null)
                }}
                style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', borderBottom: '1px solid #2a2a2a', cursor: 'pointer', textAlign: 'left', color: '#f0ebe3', fontFamily: 'var(--font-sans)', fontSize: 13 }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#222')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'none')}
              >
                {a.displayName}
              </button>
            ))}
            {(athletes as CoachAthleteListItem[] | undefined)?.filter(a => a.athleteId !== athleteId).length === 0 && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#555', padding: '8px 0' }}>
                No hay otros atletas vinculados
              </div>
            )}
            <button
              onClick={() => setCopyModalPlanId(null)}
              style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 10, color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#888')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#555')}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface PlanCardProps {
  plan: StudyPlan
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onCopyToAthlete: () => void
}

function PlanCard({ plan, onEdit, onDelete, onDuplicate, onCopyToAthlete }: PlanCardProps) {
  const isPublished = plan.status === 'PUBLISHED'

  return (
    <div
      onClick={onEdit}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onEdit() }}
      style={{
        background: '#1a1a1a',
        padding: 16,
        cursor: 'pointer',
        position: 'relative',
        borderLeft: `3px solid ${isPublished ? '#22c55e' : '#555'}`,
        transition: 'background 150ms',
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLElement).style.background = '#1e1e1e'
        const actions = (e.currentTarget as HTMLElement).querySelector<HTMLElement>('[data-card-actions]')
        if (actions) actions.style.opacity = '1'
        const del = (e.currentTarget as HTMLElement).querySelector<HTMLElement>('[data-delete-btn]')
        if (del) del.style.opacity = '1'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.background = '#1a1a1a'
        const actions = (e.currentTarget as HTMLElement).querySelector<HTMLElement>('[data-card-actions]')
        if (actions) actions.style.opacity = '0'
        const del = (e.currentTarget as HTMLElement).querySelector<HTMLElement>('[data-delete-btn]')
        if (del) del.style.opacity = '0'
      }}
    >
      {/* Delete button */}
      <button
        type="button"
        data-delete-btn
        onClick={e => { e.stopPropagation(); onDelete() }}
        style={{
          position: 'absolute', top: 10, right: 10,
          background: 'transparent', border: 'none', color: '#555', cursor: 'pointer',
          fontFamily: 'var(--font-mono)', fontSize: 11, padding: '2px 4px',
          opacity: 0, transition: 'opacity 120ms, color 120ms',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#ef4444')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#555')}
        aria-label={`Eliminar plan ${plan.title}`}
      >
        ✕
      </button>

      {/* Card top: title + status badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10, paddingRight: 20 }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 700, color: '#f0ebe3', lineHeight: 1.2, flex: 1 }}>
          {plan.title}
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          padding: '3px 7px', flexShrink: 0,
          color: isPublished ? '#22c55e' : '#555',
          border: `1px solid ${isPublished ? '#22c55e44' : '#333'}`,
        }}>
          {isPublished ? 'PUBLICADO' : 'BORRADOR'}
        </span>
      </div>

      {/* Block previews */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 10 }}>
        {(plan.blocks ?? []).slice(0, 3).map(b => (
          <div
            key={b.id}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 10, color: '#888' }}
          >
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#444', flexShrink: 0, display: 'inline-block' }} />
            {b.title || 'Bloque sin título'}
          </div>
        ))}
        {(plan.blocks ?? []).length > 3 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 10, color: '#444' }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#333', flexShrink: 0, display: 'inline-block' }} />
            +{(plan.blocks ?? []).length - 3} más
          </div>
        )}
        {(plan.blocks ?? []).length === 0 && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#555', fontStyle: 'italic' }}>
            Sin bloques
          </div>
        )}
      </div>

      {/* Footer: date + viewed */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #2a2a2a' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#555' }}>
          {plan.createdAt
            ? new Date(plan.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
            : ''}
        </span>
        {plan.viewedByAthlete ? (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#22c55e' }}>
            👁 Visto por atleta
          </span>
        ) : (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#444' }}>
            No visto
          </span>
        )}
      </div>

      {/* Duplicate / copy-to-athlete actions */}
      <div
        data-card-actions
        style={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', gap: 4, opacity: 0, transition: 'opacity 120ms' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          title="Duplicar"
          onClick={onDuplicate}
          style={{
            background: 'transparent', border: '1px solid #3a3a3a', color: '#555', cursor: 'pointer',
            fontFamily: 'var(--font-mono)', fontSize: 11, padding: '2px 6px',
            transition: 'color 120ms, border-color 120ms',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f0ebe3'; (e.currentTarget as HTMLElement).style.borderColor = '#888' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#555'; (e.currentTarget as HTMLElement).style.borderColor = '#3a3a3a' }}
        >
          ⧉
        </button>
        <button
          type="button"
          title="Copiar a otro atleta"
          onClick={onCopyToAthlete}
          style={{
            background: 'transparent', border: '1px solid #3a3a3a', color: '#555', cursor: 'pointer',
            fontFamily: 'var(--font-mono)', fontSize: 11, padding: '2px 6px',
            transition: 'color 120ms, border-color 120ms',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f0ebe3'; (e.currentTarget as HTMLElement).style.borderColor = '#888' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#555'; (e.currentTarget as HTMLElement).style.borderColor = '#3a3a3a' }}
        >
          →
        </button>
      </div>
    </div>
  )
}
