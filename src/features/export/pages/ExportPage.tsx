import { apiClient } from '@/shared/api/client'
import { Button } from '@/shared/components/ui/button'
import { useState } from 'react'
import { Download } from 'lucide-react'

export function ExportPage() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const data = await apiClient.get('export/full').json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ossflow-export-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Exportar datos</h1>
        <p className="text-muted-foreground">
          Descarga una copia completa de tu catálogo en formato JSON.
        </p>
      </div>
      <div className="rounded-lg border p-6 space-y-4">
        <h2 className="font-semibold">Backup completo</h2>
        <p className="text-sm text-muted-foreground">
          Exporta posiciones, técnicas, sistemas, notas, sesiones de entrenamiento, competencias y
          planes de estudio.
        </p>
        <Button onClick={handleExport} disabled={isExporting} className="gap-2">
          <Download size={16} />
          {isExporting ? 'Exportando...' : 'Descargar JSON'}
        </Button>
      </div>
    </div>
  )
}
