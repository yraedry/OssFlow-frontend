import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useConfirm } from '@/shared/hooks/useConfirm'
import { useCoachStudyPlans, useCreateStudyPlan, useDeleteStudyPlan } from './hooks'
import { StudyPlanEditor } from './StudyPlanEditor'
import { Spinner } from '@/shared/components/ui/spinner'
import type { StudyPlan } from './types'

interface Props {
  athleteId: number
}

export function CoachStudyPlanTab({ athleteId }: Props) {
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const confirm = useConfirm()

  const { data: plans, isLoading } = useCoachStudyPlans(athleteId)
  const create = useCreateStudyPlan(athleteId)
  const deletePlan = useDeleteStudyPlan(athleteId)

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', margin: 0 }}>
          Planes de estudio
        </p>
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

      {/* Plan grid */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
          <Spinner />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#2a2a2a' }}>
          {(plans ?? []).map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={() => setEditingPlanId(plan.id)}
              onDelete={() => handleDelete(plan)}
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
    </div>
  )
}

function PlanCard({ plan, onEdit, onDelete }: { plan: StudyPlan; onEdit: () => void; onDelete: () => void }) {
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
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#1e1e1e')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#1a1a1a')}
      className="group"
    >
      {/* Delete button — visible on hover via className group */}
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onDelete() }}
        style={{
          position: 'absolute', top: 10, right: 10,
          background: 'transparent', border: 'none', color: '#555', cursor: 'pointer',
          fontFamily: 'var(--font-mono)', fontSize: 11, padding: '2px 4px',
          opacity: 0, transition: 'opacity 120ms, color 120ms',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#ef4444')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#555')}
        onFocus={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
        onBlur={e => ((e.currentTarget as HTMLElement).style.opacity = '0')}
        ref={el => {
          // Show delete button when parent card is hovered
          if (!el) return
          const card = el.closest('[role="button"]') as HTMLElement | null
          if (!card) return
          const show = () => (el.style.opacity = '1')
          const hide = () => (el.style.opacity = '0')
          card.addEventListener('mouseenter', show)
          card.addEventListener('mouseleave', hide)
        }}
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
    </div>
  )
}
