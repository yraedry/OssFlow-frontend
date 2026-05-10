import { useState } from 'react'
import { useConfirm } from '@/shared/hooks/useConfirm'
import { Plus, Building2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { PaginationControls } from '@/shared/components/ui/pagination-controls'
import { RulesetCard } from '../components/RulesetCard'
import { RulesetForm } from '../components/RulesetForm'
import { useRulesets, useCreateRuleset, useUpdateRuleset, useDeleteRuleset } from '../hooks'
import { useCreateFederation } from '@/features/identity/federation/hooks'
import type { Ruleset } from '../types'
import type { CreateRulesetForm } from '../schemas'

const createFederationSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  code: z.string().min(2, 'Mínimo 2 caracteres').max(8, 'Máximo 8 caracteres').toUpperCase(),
  officialUrl: z.string().url('URL no válida').optional().or(z.literal('')),
})
type CreateFederationFormData = z.infer<typeof createFederationSchema>

export function RulesetsPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Ruleset | null>(null)
  const [fedOpen, setFedOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)

  const { data, isLoading, error } = useRulesets({ page: currentPage, size: 20 })
  const createMutation = useCreateRuleset()
  const updateMutation = useUpdateRuleset()
  const deleteMutation = useDeleteRuleset()
  const createFederationMutation = useCreateFederation()
  const confirm = useConfirm()

  const fedForm = useForm<CreateFederationFormData>({
    resolver: zodResolver(createFederationSchema),
    defaultValues: { name: '', code: '', officialUrl: '' },
  })

  const handleSubmit = async (formData: CreateRulesetForm) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: formData })
    } else {
      await createMutation.mutateAsync(formData)
    }
    setOpen(false)
    setEditing(null)
  }

  const handleEdit = (ruleset: Ruleset) => {
    setEditing(ruleset)
    setOpen(true)
  }

  const handleDelete = async (id: number) => {
    const ok = await confirm({ description: '¿Eliminar este reglamento? Esta acción no se puede deshacer.' })
    if (!ok) return
    await deleteMutation.mutateAsync(id)
  }

  const handleOpenChange = (o: boolean) => {
    setOpen(o)
    if (!o) setEditing(null)
  }

  const handleCreateFederation = async (data: CreateFederationFormData) => {
    await createFederationMutation.mutateAsync({
      name: data.name,
      code: data.code.toUpperCase(),
      officialUrl: data.officialUrl || undefined,
    })
    setFedOpen(false)
    fedForm.reset()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 border border-border bg-card px-5 py-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
            Catálogo
          </div>
          <h1 className="text-2xl font-black leading-none" style={{ fontFamily: 'var(--font-serif)' }}>
            Reglamentos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data?.totalElements ?? 0} reglamentos en tu catálogo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={fedOpen} onOpenChange={setFedOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-2 border border-border text-xs font-bold uppercase tracking-wide hover:bg-accent transition-colors"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                <Building2 className="h-3.5 w-3.5" />
                Federación
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva federación</DialogTitle>
              </DialogHeader>
              <form onSubmit={fedForm.handleSubmit(handleCreateFederation)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fed-name">Nombre *</Label>
                  <Input id="fed-name" {...fedForm.register('name')} placeholder="IBJJF" />
                  {fedForm.formState.errors.name && (
                    <p className="text-sm text-destructive">{fedForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fed-code">Código (2-8 caracteres) *</Label>
                  <Input
                    id="fed-code"
                    {...fedForm.register('code')}
                    placeholder="IBJJF"
                    className="uppercase"
                    style={{ textTransform: 'uppercase' }}
                  />
                  {fedForm.formState.errors.code && (
                    <p className="text-sm text-destructive">{fedForm.formState.errors.code.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fed-url">Website (opcional)</Label>
                  <Input id="fed-url" {...fedForm.register('officialUrl')} placeholder="https://ibjjf.com" />
                  {fedForm.formState.errors.officialUrl && (
                    <p className="text-sm text-destructive">{fedForm.formState.errors.officialUrl.message}</p>
                  )}
                </div>
                <Button type="submit" disabled={createFederationMutation.isPending} className="w-full">
                  {createFederationMutation.isPending ? 'Creando...' : 'Crear federación'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="flex items-center gap-1.5 px-3 py-2 border border-border text-xs font-bold uppercase tracking-wide hover:bg-accent transition-colors"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                Reglamento
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? 'Editar reglamento' : 'Nuevo Reglamento'}</DialogTitle>
              </DialogHeader>
              <RulesetForm
                defaultValues={editing ?? undefined}
                onSubmit={handleSubmit}
                isPending={createMutation.isPending || updateMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>Error al cargar los reglamentos</AlertDescription>
        </Alert>
      ) : (data?.content ?? []).length === 0 ? (
        <div className="border border-dashed border-border py-16 text-center text-muted-foreground">
          <p className="text-sm font-medium">No hay reglamentos todavía</p>
          <p className="text-xs mt-1">Crea tu primer reglamento con el botón de arriba</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(data?.content ?? []).map((r) => (
              <RulesetCard key={r.id} ruleset={r} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
          <PaginationControls page={currentPage} totalPages={data?.totalPages ?? 1} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  )
}
