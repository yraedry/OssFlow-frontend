import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { RulesetCard } from '../components/RulesetCard'
import { RulesetForm } from '../components/RulesetForm'
import { useRulesets, useCreateRuleset, useUpdateRuleset, useDeleteRuleset } from '../hooks'
import type { Ruleset } from '../types'
import type { CreateRulesetForm } from '../schemas'

export function RulesetsPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Ruleset | null>(null)

  const { data, isLoading, error } = useRulesets()
  const createMutation = useCreateRuleset()
  const updateMutation = useUpdateRuleset()
  const deleteMutation = useDeleteRuleset()

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
    if (!confirm('¿Eliminar este reglamento?')) return
    await deleteMutation.mutateAsync(id)
  }

  const handleOpenChange = (o: boolean) => {
    setOpen(o)
    if (!o) setEditing(null)
  }

  if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>
  if (error)
    return (
      <Alert variant="destructive">
        <AlertDescription>Error al cargar los reglamentos</AlertDescription>
      </Alert>
    )

  const rulesets = data?.content ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reglamentos</h1>
          <p className="text-muted-foreground">
            {data?.totalElements ?? 0} reglamentos en tu catálogo
          </p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Reglamento
            </Button>
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

      {rulesets.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No hay reglamentos todavía.</p>
          <p className="text-sm">Crea tu primer reglamento con el botón de arriba.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rulesets.map((r) => (
            <RulesetCard key={r.id} ruleset={r} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
