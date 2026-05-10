import { useState } from 'react'
import { useConfirm } from '@/shared/hooks/useConfirm'
import { Plus, Trash2, BookOpen, X, Play, Pencil, Copy } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { PaginationControls } from '@/shared/components/ui/pagination-controls'
import { useTrainingSessions, useTrainingSession, useCreateTrainingSession, useDeleteTrainingSession, useUpsertWorkedTechnique, useRemoveWorkedTechnique, SESSIONS_KEY } from '../hooks'
import { useTechniques } from '@/features/catalog/technique/hooks'
import { useUpdateTrainingSession } from '../hooks'
import { useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Intensity, TrainingSession, TrainingSessionWithVideo } from '../types'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)' }

const INTENSITY_LABELS: Record<Intensity, string> = {
  LIGHT: 'Baja', MODERATE: 'Moderada', HARD: 'Alta', COMPETITION: 'Competición',
}
const INTENSITY_COLORS: Record<Intensity, string> = {
  LIGHT: '#10b981', MODERATE: '#f59e0b', HARD: '#f97316', COMPETITION: '#e11d48',
}

const INPUT_CLASS = 'w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground transition-colors'
const LABEL_STYLE: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted-foreground)' }

function formatDate(iso: string) {
  try { return format(new Date(iso + 'T00:00:00'), "d MMM yyyy", { locale: es }) } catch { return iso }
}

function SessionDetailDialog({ session }: { session: TrainingSession }) {
  const [selectedId, setSelectedId] = useState('')
  const [notes, setNotes] = useState('')

  const qc = useQueryClient()
  const { data: liveSession, isLoading } = useTrainingSession(session.id)
  const { data: techniquesData } = useTechniques({ size: 200 })
  const upsert = useUpsertWorkedTechnique(session.id)
  const remove = useRemoveWorkedTechnique(session.id)

  const techniques = techniquesData?.content ?? []
  const worked = (liveSession ?? session).workedTechniques ?? []
  const accent = INTENSITY_COLORS[session.intensity] ?? '#6b7280'

  const handleAdd = async () => {
    if (!selectedId) return
    await upsert.mutateAsync({ techniqueId: Number(selectedId), data: { notesMarkdown: notes || undefined } })
    await qc.refetchQueries({ queryKey: [...SESSIONS_KEY, session.id] })
    setSelectedId(''); setNotes('')
  }

  const handleRemove = async (techniqueId: number) => {
    await remove.mutateAsync(techniqueId)
    await qc.refetchQueries({ queryKey: [...SESSIONS_KEY, session.id] })
  }

  return (
    <div className="space-y-5 overflow-y-auto max-h-[75vh] min-w-0">
      {/* Cabecera de sesión */}
      <div className="border-l-2 pl-3" style={{ borderColor: accent }}>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ ...MONO, color: accent }}>
          {INTENSITY_LABELS[session.intensity]}
        </span>
        <p className="text-base font-semibold mt-0.5" style={{ fontFamily: 'var(--font-serif)' }}>
          {session.location ? session.location : formatDate(session.sessionDate)}
        </p>
        {session.location && (
          <p className="text-[10px] text-muted-foreground" style={MONO}>{formatDate(session.sessionDate)}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1" style={MONO}>
          {session.durationMinutes} min{session.location ? ` · ${session.location}` : ''}
        </p>
      </div>

      {session.notesMarkdown && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1" style={MONO}>Notas</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{session.notesMarkdown}</p>
        </div>
      )}

      {/* Técnicas */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5" style={MONO}>
          <BookOpen className="h-3 w-3" />
          Técnicas trabajadas
          {worked.length > 0 && (
            <span className="font-bold" style={{ color: '#4a7cff' }}>({worked.length})</span>
          )}
        </p>

        {isLoading ? (
          <div className="flex justify-center py-4"><Spinner /></div>
        ) : worked.length === 0 ? (
          <p className="text-xs text-muted-foreground" style={MONO}>Sin técnicas registradas aún.</p>
        ) : (
          <ul className="space-y-1.5 mb-4">
            {worked.map((wt) => {
              const name = wt.techniqueName ?? techniques.find(t => t.id === wt.techniqueId)?.name ?? `#${wt.techniqueId}`
              return (
                <li key={wt.techniqueId} className="flex items-start justify-between border border-border bg-muted/20 px-3 py-2 gap-2">
                  <div className="min-w-0">
                    <span className="text-xs font-medium">{name}</span>
                    {wt.notesMarkdown && (
                      <p className="text-[10px] text-muted-foreground mt-0.5" style={MONO}>{wt.notesMarkdown}</p>
                    )}
                  </div>
                  <button type="button" onClick={() => handleRemove(wt.techniqueId)} disabled={remove.isPending}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-0.5">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {/* Añadir técnica */}
        <div className="border border-border bg-muted/10 p-3 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground" style={MONO}>Añadir técnica</p>
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
            className="w-full border border-border bg-background px-2.5 py-2 text-xs focus:outline-none"
            style={MONO}
          >
            <option value="">— Seleccionar técnica —</option>
            {techniques.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <div className="flex gap-2">
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Notas (opcional)"
              className="flex-1 border border-border bg-background px-2.5 py-1.5 text-xs focus:outline-none"
              style={MONO}
            />
            <button type="button" onClick={handleAdd} disabled={!selectedId || upsert.isPending}
              className="flex items-center gap-1 px-3 py-1.5 text-[10px] uppercase tracking-wide bg-foreground text-background hover:opacity-85 transition-opacity disabled:opacity-40"
              style={MONO}
            >
              <Plus className="h-3 w-3" />
              {upsert.isPending ? '...' : 'Añadir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SessionForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel,
}: {
  defaultValues?: Partial<TrainingSession>
  onSubmit: (data: { sessionDate: string; durationMinutes: number; intensity: Intensity; location: string; notes: string; youtubeUrl: string }) => void
  isPending?: boolean
  submitLabel: string
}) {
  const today = new Date().toISOString().split('T')[0]
  const [sessionDate, setSessionDate] = useState(defaultValues?.sessionDate ?? today)
  const [durationMinutes, setDurationMinutes] = useState(defaultValues?.durationMinutes ?? 90)
  const [intensity, setIntensity] = useState<Intensity>((defaultValues?.intensity as Intensity) ?? 'MODERATE')
  const [location, setLocation] = useState(defaultValues?.location ?? '')
  const [notes, setNotes] = useState(defaultValues?.notesMarkdown ?? '')
  const [youtubeUrl, setYoutubeUrl] = useState((defaultValues as TrainingSessionWithVideo)?.youtubeUrl ?? '')

  const intensities: Intensity[] = ['LIGHT', 'MODERATE', 'HARD', 'COMPETITION']

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({ sessionDate, durationMinutes: Number(durationMinutes), intensity, location, notes, youtubeUrl })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label style={LABEL_STYLE}>Fecha</label>
          <input type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)}
            className={INPUT_CLASS} style={MONO} required />
        </div>
        <div className="space-y-1">
          <label style={LABEL_STYLE}>Duración (min)</label>
          <input type="number" min={1} max={480} value={durationMinutes}
            onChange={e => setDurationMinutes(Number(e.target.value))}
            className={INPUT_CLASS} style={MONO} required />
        </div>
      </div>

      <div className="space-y-1">
        <label style={LABEL_STYLE}>Título (opcional)</label>
        <input type="text" value={location} onChange={e => setLocation(e.target.value)}
          placeholder="Ej: Clase con profe, competición, sparring..." className={INPUT_CLASS} style={MONO} />
      </div>

      <div className="space-y-1" role="group">
        <span style={LABEL_STYLE}>Intensidad</span>
        <div className="grid grid-cols-4 gap-1">
          {intensities.map(i => (
            <button key={i} type="button" onClick={() => setIntensity(i)}
              className="py-1.5 border text-center transition-colors"
              style={{
                ...MONO, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.06em',
                borderColor: intensity === i ? INTENSITY_COLORS[i] : 'var(--color-border)',
                backgroundColor: intensity === i ? INTENSITY_COLORS[i] + '20' : 'transparent',
                color: intensity === i ? INTENSITY_COLORS[i] : 'var(--color-muted-foreground)',
              }}
            >
              {INTENSITY_LABELS[i]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label style={LABEL_STYLE}>Notas</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          rows={2} placeholder="Técnicas trabajadas, sparring..."
          className={INPUT_CLASS + ' resize-none'} style={MONO} />
      </div>

      <div className="space-y-1">
        <label style={LABEL_STYLE}>URL sparring / video (opcional)</label>
        <input type="url" value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className={INPUT_CLASS} style={MONO} />
      </div>

      <button type="submit" disabled={isPending}
        className="w-full py-2.5 bg-foreground text-background hover:opacity-85 transition-opacity disabled:opacity-50"
        style={{ ...MONO, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}
      >
        {isPending ? 'Guardando...' : submitLabel}
      </button>
    </form>
  )
}

function AddTechniquesStep({ sessionId, onDone }: { sessionId: number; onDone: () => void }) {
  const [selectedId, setSelectedId] = useState('')
  const [notes, setNotes] = useState('')

  const qc = useQueryClient()
  const { data: liveSession } = useTrainingSession(sessionId)
  const { data: techniquesData } = useTechniques({ size: 200 })
  const upsert = useUpsertWorkedTechnique(sessionId)
  const remove = useRemoveWorkedTechnique(sessionId)

  const techniques = techniquesData?.content ?? []
  const worked = liveSession?.workedTechniques ?? []

  const handleAdd = async () => {
    if (!selectedId) return
    await upsert.mutateAsync({ techniqueId: Number(selectedId), data: { notesMarkdown: notes || undefined } })
    await qc.refetchQueries({ queryKey: [...SESSIONS_KEY, sessionId] })
    setSelectedId(''); setNotes('')
  }

  const handleRemove = async (techniqueId: number) => {
    await remove.mutateAsync(techniqueId)
    await qc.refetchQueries({ queryKey: [...SESSIONS_KEY, sessionId] })
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground" style={MONO}>Sesión creada. Añade las técnicas trabajadas hoy (opcional).</p>

      {worked.length > 0 && (
        <ul className="space-y-1">
          {worked.map(wt => {
            const name = wt.techniqueName ?? techniques.find(t => t.id === wt.techniqueId)?.name ?? `#${wt.techniqueId}`
            return (
              <li key={wt.techniqueId} className="flex items-center justify-between border border-border bg-muted/20 px-3 py-2">
                <div className="min-w-0">
                  <span className="text-xs font-medium">{name}</span>
                  {wt.notesMarkdown && <span className="text-[10px] text-muted-foreground ml-1" style={MONO}>· {wt.notesMarkdown}</span>}
                </div>
                <button type="button" onClick={() => handleRemove(wt.techniqueId)} disabled={remove.isPending}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0 ml-2">
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="border border-border p-3 space-y-2">
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
          className="w-full border border-border bg-background px-2.5 py-2 text-xs focus:outline-none"
          style={MONO}
        >
          <option value="">— Seleccionar técnica —</option>
          {techniques.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <div className="flex gap-2">
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Notas (opcional)" className="flex-1 border border-border bg-background px-2.5 py-1.5 text-xs focus:outline-none" style={MONO} />
          <button type="button" onClick={handleAdd} disabled={!selectedId || upsert.isPending}
            className="flex items-center gap-1 px-3 py-1.5 text-[10px] uppercase tracking-wide bg-foreground text-background hover:opacity-85 transition-opacity disabled:opacity-40"
            style={MONO}
          >
            <Plus className="h-3 w-3" />
            {upsert.isPending ? '...' : 'Añadir'}
          </button>
        </div>
      </div>

      <button type="button" onClick={onDone}
        className="w-full py-2.5 bg-foreground text-background hover:opacity-85 transition-opacity"
        style={{ ...MONO, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}
      >
        Finalizar
      </button>
    </div>
  )
}

export function TrainingSessionsPage() {
  const [open, setOpen] = useState(false)
  const [createdSession, setCreatedSession] = useState<TrainingSession | null>(null)
  const [prefillValues, setPrefillValues] = useState<Partial<TrainingSession> | undefined>()
  const [editSession, setEditSession] = useState<TrainingSession | null>(null)
  const [detailSession, setDetailSession] = useState<TrainingSession | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const { data, isLoading, error } = useTrainingSessions({ page: currentPage, size: 20 })
  const createMutation = useCreateTrainingSession()
  const updateMutation = useUpdateTrainingSession()
  const deleteMutation = useDeleteTrainingSession()
  const confirm = useConfirm()

  const handleOpenChange = (v: boolean) => {
    setOpen(v)
    if (!v) { setCreatedSession(null); setPrefillValues(undefined) }
  }

  const handleDuplicate = (session: TrainingSession) => {
    const today = new Date().toISOString().split('T')[0]
    setPrefillValues({ ...session, sessionDate: today })
    setOpen(true)
  }

  const handleCreate = async (formData: { sessionDate: string; durationMinutes: number; intensity: Intensity; location: string; notes: string; youtubeUrl: string }) => {
    const session = await createMutation.mutateAsync({
      sessionDate: formData.sessionDate,
      durationMinutes: formData.durationMinutes,
      intensity: formData.intensity,
      sessionType: 'BJJ',
      location: formData.location || undefined,
      notesMarkdown: formData.notes || undefined,
      youtubeUrl: formData.youtubeUrl || undefined,
    } as Parameters<typeof createMutation.mutateAsync>[0])
    setCreatedSession(session)
  }

  const handleUpdate = async (formData: { sessionDate: string; durationMinutes: number; intensity: Intensity; location: string; notes: string; youtubeUrl: string }) => {
    if (!editSession) return
    await updateMutation.mutateAsync({
      id: editSession.id,
      data: {
        sessionDate: formData.sessionDate,
        durationMinutes: formData.durationMinutes,
        intensity: formData.intensity,
        sessionType: 'BJJ',
        location: formData.location || undefined,
        notesMarkdown: formData.notes || undefined,
        youtubeUrl: formData.youtubeUrl || undefined,
      } as Parameters<typeof createMutation.mutateAsync>[0],
    })
    setEditSession(null)
  }

  const handleDelete = async (id: number) => {
    const ok = await confirm({ description: '¿Eliminar esta sesión? Esta acción no se puede deshacer.' })
    if (ok) deleteMutation.mutate(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 border border-border bg-card px-5 py-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1" style={MONO}>
            Diario
          </div>
          <h1 className="text-2xl font-black leading-none" style={{ fontFamily: 'var(--font-serif)' }}>
            Sesiones BJJ
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{data?.totalElements ?? 0} sesiones registradas</p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <button type="button"
              onClick={() => setPrefillValues(undefined)}
              className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-xs font-bold uppercase tracking-wide hover:opacity-85 transition-opacity shrink-0"
              style={MONO}
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Nueva
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {createdSession ? 'Técnicas trabajadas' : prefillValues ? 'Duplicar sesión BJJ' : 'Nueva sesión BJJ'}
              </DialogTitle>
            </DialogHeader>
            {createdSession
              ? <AddTechniquesStep sessionId={createdSession.id} onDone={() => { setOpen(false); setCreatedSession(null) }} />
              : <SessionForm
                  defaultValues={prefillValues}
                  onSubmit={handleCreate}
                  isPending={createMutation.isPending}
                  submitLabel={prefillValues ? 'Guardar copia' : 'Crear sesión'}
                />
            }
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog de edición */}
      <Dialog open={!!editSession} onOpenChange={v => { if (!v) setEditSession(null) }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar sesión BJJ</DialogTitle>
          </DialogHeader>
          {editSession && (
            <SessionForm
              defaultValues={editSession}
              onSubmit={handleUpdate}
              isPending={updateMutation.isPending}
              submitLabel="Guardar cambios"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de detalle / técnicas */}
      <Dialog open={!!detailSession} onOpenChange={v => { if (!v) setDetailSession(null) }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de sesión</DialogTitle>
          </DialogHeader>
          {detailSession && (
            <SessionDetailDialog session={detailSession} />
          )}
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : error ? (
        <Alert variant="destructive"><AlertDescription>Error al cargar sesiones</AlertDescription></Alert>
      ) : (data?.content ?? []).length === 0 ? (
        <div className="border border-dashed border-border py-16 text-center text-muted-foreground">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No hay sesiones BJJ todavía</p>
          <p className="text-xs mt-1">Registra tu primera sesión con el botón de arriba</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {(data?.content ?? []).filter(Boolean).map((s) => {
              const accent = INTENSITY_COLORS[s.intensity] ?? '#6b7280'
              return (
                <div key={s.id} id={`session-${s.id}`}
                  className="group relative flex flex-col bg-card border border-border hover:border-foreground/40 transition-colors cursor-pointer"
                  style={{ borderLeft: `3px solid ${accent}` }}
                  onClick={() => setDetailSession(s)}
                >
                  {/* Botones hover — detienen la propagación */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-1">
                    <button type="button" aria-label="Editar sesión"
                      onClick={e => { e.stopPropagation(); setEditSession(s) }}
                      className="h-7 w-7 flex items-center justify-center border border-border bg-background text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil className="h-3 w-3" strokeWidth={1.5} />
                    </button>
                    <button type="button" aria-label="Duplicar sesión"
                      onClick={e => { e.stopPropagation(); handleDuplicate(s) }}
                      className="h-7 w-7 flex items-center justify-center border border-border bg-background text-muted-foreground hover:text-foreground transition-colors">
                      <Copy className="h-3 w-3" strokeWidth={1.5} />
                    </button>
                    <button type="button" aria-label="Eliminar sesión"
                      onClick={e => { e.stopPropagation(); handleDelete(s.id) }}
                      className="h-7 w-7 flex items-center justify-center border border-destructive/50 bg-background text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                    </button>
                  </div>

                  <div className="p-4 flex flex-col gap-1.5 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ ...MONO, color: accent }}>
                      {INTENSITY_LABELS[s.intensity]}
                    </span>
                    <p className="text-sm font-semibold leading-snug pr-24" style={{ fontFamily: 'var(--font-serif)' }}>
                      {s.location ? s.location : formatDate(s.sessionDate)}
                    </p>
                    {s.location && (
                      <p className="text-[10px] text-muted-foreground" style={MONO}>{formatDate(s.sessionDate)}</p>
                    )}
                    {s.notesMarkdown && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{s.notesMarkdown}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between px-4 py-2 border-t border-border/50">
                    <span className="text-[10px] text-muted-foreground" style={MONO}>
                      {s.durationMinutes} min{s.location ? ` · ${s.location}` : ''}
                    </span>
                    <div className="flex items-center gap-2">
                      {(s.workedTechniques?.length ?? 0) > 0 && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground" style={MONO}>
                          <BookOpen className="h-2.5 w-2.5" strokeWidth={1.5} />
                          {s.workedTechniques.length}
                        </span>
                      )}
                      {(s as TrainingSessionWithVideo).youtubeUrl && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground" style={MONO}>
                          <Play className="h-2.5 w-2.5" strokeWidth={1.5} />
                          VIDEO
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <PaginationControls page={currentPage} totalPages={data?.totalPages ?? 1} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  )
}
