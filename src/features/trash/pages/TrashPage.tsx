import { Trash2 } from 'lucide-react'

export function TrashPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Papelera</h1>
        <p className="text-muted-foreground">Elementos eliminados recientemente.</p>
      </div>
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border rounded-lg">
        <Trash2 size={48} className="mb-4 opacity-30" />
        <p className="text-lg">La papelera está vacía</p>
        <p className="text-sm">Los elementos eliminados aparecerán aquí.</p>
      </div>
    </div>
  )
}
