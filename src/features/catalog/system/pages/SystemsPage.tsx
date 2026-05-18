import { useState } from 'react'
import { useConfirm } from '@/shared/hooks/useConfirm'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { SearchInput } from '@/shared/components/ui/search-input'
import { Plus, GitBranch } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { PaginationControls } from '@/shared/components/ui/pagination-controls'
import { SystemCard } from '../components/SystemCard'
import { SystemForm } from '../components/SystemForm'
import { useSystems, useCreateSystem, useUpdateSystem, useDeleteSystem } from '../hooks'
import type { System } from '../types'
import type { CreateSystemForm } from '../schemas'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)' }
const SERIF: React.CSSProperties = { fontFamily: 'var(--font-serif)' }

export function SystemsPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<System | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery)

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(0)
  }

  const { data, isLoading, error } = useSystems({
    page: currentPage,
    size: 20,
    search: debouncedSearch || undefined,
  })
  const createMutation = useCreateSystem()
  const updateMutation = useUpdateSystem()
  const deleteMutation = useDeleteSystem()
  const confirm = useConfirm()

  const handleSubmit = async (formData: CreateSystemForm) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: formData })
    } else {
      await createMutation.mutateAsync(formData)
    }
    setOpen(false)
    setEditing(null)
  }

  const handleEdit = (system: System) => {
    setEditing(system)
    setOpen(true)
  }

  const handleDelete = async (id: number) => {
    const ok = await confirm({ description: '¿Eliminar este sistema? Esta acción no se puede deshacer.' })
    if (!ok) return
    await deleteMutation.mutateAsync(id)
  }

  const handleOpenChange = (o: boolean) => {
    setOpen(o)
    if (!o) setEditing(null)
  }

  const systems = data?.content ?? []

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 border border-border bg-card px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            Estudio
          </p>
          <h1 className="font-serif text-[clamp(22px,3vw,30px)] font-black leading-none tracking-tight text-foreground">
            Sistemas
          </h1>
        </div>
        <button
          onClick={() => { setEditing(null); setOpen(true) }}
          className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background text-xs font-mono font-bold uppercase tracking-wide hover:opacity-85 transition-opacity shrink-0 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          Nuevo
        </button>
      </div>

      {/* Buscador */}
      <SearchInput
        value={searchQuery}
        onChange={handleSearch}
        placeholder="Buscar sistemas..."
      />

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>Error al cargar los sistemas</AlertDescription>
        </Alert>
      ) : systems.length === 0 ? (
        <div className="border border-border border-dashed bg-card p-16 flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 border border-border flex items-center justify-center">
            <GitBranch className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-semibold" style={SERIF}>{debouncedSearch ? `Sin resultados para "${debouncedSearch}"` : 'Sin sistemas todavía'}</p>
            {!debouncedSearch && (
              <p className="text-sm text-muted-foreground mt-1" style={MONO}>
                Crea diagramas de flujo para visualizar tus posiciones y transiciones de BJJ
              </p>
            )}
          </div>
          {!debouncedSearch && (
            <button
              onClick={() => { setEditing(null); setOpen(true) }}
              className="flex items-center gap-2 px-4 py-2 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"
              style={{ ...MONO, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              Crear sistema
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {systems.map((s) => (
              <SystemCard key={s.id} system={s} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
          <PaginationControls page={currentPage} totalPages={data?.totalPages ?? 1} onPageChange={setCurrentPage} />
        </>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar sistema' : 'Nuevo sistema'}</DialogTitle>
          </DialogHeader>
          <SystemForm
            defaultValues={editing ?? undefined}
            onSubmit={handleSubmit}
            isPending={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
