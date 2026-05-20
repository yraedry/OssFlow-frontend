import { useState } from 'react'
import { Pencil, Trash2, Check, X, Plus } from 'lucide-react'
import { useGyms, useCreateGym, useUpdateGym, useDeleteGym } from './hooks'

export function GymTab() {
  const { data: gyms, isLoading } = useGyms()
  const create = useCreateGym()
  const update = useUpdateGym()
  const deleteGym = useDeleteGym()

  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')

  async function handleCreate() {
    if (!newName.trim()) return
    await create.mutateAsync({ name: newName.trim() })
    setNewName('')
    setAdding(false)
  }

  function startEdit(id: number, name: string) {
    setEditingId(id)
    setEditName(name)
  }

  async function saveEdit() {
    if (!editName.trim() || editingId === null) return
    await update.mutateAsync({ id: editingId, name: editName.trim() })
    setEditingId(null)
  }

  async function handleDelete(id: number) {
    if (!window.confirm('¿Eliminar este gimnasio?')) return
    deleteGym.mutate(id)
  }

  if (isLoading) return <div className="py-8 text-center text-muted-foreground text-sm">Cargando...</div>

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Mis gimnasios
        </p>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            Añadir
          </button>
        )}
      </div>

      {adding && (
        <div className="flex gap-2 items-center border border-border p-2">
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setAdding(false) }}
            placeholder="Nombre del gimnasio"
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <button type="button" onClick={handleCreate} className="p-1 text-foreground hover:opacity-70">
            <Check className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button type="button" onClick={() => setAdding(false)} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {(gyms ?? []).length === 0 && !adding && (
        <p className="text-sm text-muted-foreground italic">No tienes gimnasios todavía.</p>
      )}

      <div className="space-y-1">
        {(gyms ?? []).map(gym => (
          <div key={gym.id} className="group flex items-center gap-2 border border-border/50 px-3 py-2 hover:border-border transition-colors">
            {editingId === gym.id ? (
              <>
                <input
                  autoFocus
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null) }}
                  className="flex-1 bg-transparent text-sm outline-none border-b border-foreground"
                />
                <button type="button" onClick={saveEdit} className="p-1 text-foreground hover:opacity-70">
                  <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </>
            ) : (
              <>
                <span
                  className="flex-1 text-sm cursor-pointer hover:opacity-70"
                  onClick={() => startEdit(gym.id, gym.name)}
                >
                  {gym.name}
                  {gym.address && (
                    <span className="ml-2 text-xs text-muted-foreground">{gym.address}</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => startEdit(gym.id, gym.name)}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(gym.id)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
