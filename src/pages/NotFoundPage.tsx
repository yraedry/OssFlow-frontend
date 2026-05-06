import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Página no encontrada</p>
      <Button asChild><Link to="/">Ir al inicio</Link></Button>
    </div>
  )
}
