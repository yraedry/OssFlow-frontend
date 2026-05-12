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
const LABEL: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: '9px', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }

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
      <div className="border border-border bg-card px-5 py-4 flex items-center justify-between">
        <div>
          <div style={{ ...LABEL, color: 'var(--color-muted-foreground)', marginBottom: '4px' }}>Catálogo</div>
          <h1 className="font-black leading-none" style={{ ...SERIF, fontSize: 'clamp(22px, 3vw, 30px)', letterSpacing: '-0.02em' }}>
            Sistemas
          </h1>
          <p className="mt-1 text-xs text-muted-foreground" style={MONO}>
            Diagramas de posiciones y transiciones
          </p>
        </div>
        <div className="flex items-center gap-3">
          {systems.length > 0 && (
            <span style={{ ...LABEL, color: 'var(--color-muted-foreground)' }}>
              {data?.totalElements ?? 0} sistemas
            </span>
          )}
          <button
            onClick={() => { setEditing(null); setOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background hover:opacity-85 transition-opacity"
            style={{ ...MONO, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            Nuevo
          </button>
        </div>
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
