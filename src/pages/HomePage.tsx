import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'

export function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido a OssFlow — tu segundo cerebro BJJ</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Técnicas</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground">Gestiona tu catálogo de técnicas</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Diario</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground">Notas y sesiones de entrenamiento</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Planificación</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground">Planes de estudio y objetivos</p></CardContent>
        </Card>
      </div>
    </div>
  )
}
