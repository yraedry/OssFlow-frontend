import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

const MONO: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
}

type Crumb = { label: string; to?: string }

const ROUTE_MAP: { pattern: RegExp; crumbs: Crumb[] }[] = [
  { pattern: /^\/diario\/sesiones-bjj/, crumbs: [{ label: 'Inicio', to: '/' }, { label: 'Diario' }, { label: 'Sesiones BJJ' }] },
  { pattern: /^\/diario\/sesiones-fisicas/, crumbs: [{ label: 'Inicio', to: '/' }, { label: 'Diario' }, { label: 'Sesiones físicas' }] },
  { pattern: /^\/diario\/movilidad/, crumbs: [{ label: 'Inicio', to: '/' }, { label: 'Diario' }, { label: 'Sesiones físicas', to: '/diario/sesiones-fisicas' }, { label: 'Movilidad' }] },
  { pattern: /^\/diario\/flexibilidad/, crumbs: [{ label: 'Inicio', to: '/' }, { label: 'Diario' }, { label: 'Sesiones físicas', to: '/diario/sesiones-fisicas' }, { label: 'Flexibilidad' }] },
  { pattern: /^\/diario\/notas/, crumbs: [{ label: 'Inicio', to: '/' }, { label: 'Diario' }, { label: 'Notas' }] },
  { pattern: /^\/diario\/competicion/, crumbs: [{ label: 'Inicio', to: '/' }, { label: 'Diario' }, { label: 'Competición' }] },
  { pattern: /^\/estudio\/tecnicas/, crumbs: [{ label: 'Inicio', to: '/' }, { label: 'Estudio' }, { label: 'Técnicas' }] },
  { pattern: /^\/estudio\/posiciones/, crumbs: [{ label: 'Inicio', to: '/' }, { label: 'Estudio' }, { label: 'Posiciones' }] },
  { pattern: /^\/estudio\/sistemas/, crumbs: [{ label: 'Inicio', to: '/' }, { label: 'Estudio' }, { label: 'Sistemas' }] },
  { pattern: /^\/estudio\/ejercicios/, crumbs: [{ label: 'Inicio', to: '/' }, { label: 'Estudio' }, { label: 'Ejercicios' }] },
  { pattern: /^\/estudio\/movilidad/, crumbs: [{ label: 'Inicio', to: '/' }, { label: 'Estudio' }, { label: 'Movilidad' }] },
  { pattern: /^\/estudio\/flexibilidad/, crumbs: [{ label: 'Inicio', to: '/' }, { label: 'Estudio' }, { label: 'Flexibilidad' }] },
  { pattern: /^\/estudio\/reglamentos/, crumbs: [{ label: 'Inicio', to: '/' }, { label: 'Estudio' }, { label: 'Reglamentos' }] },
  { pattern: /^\/planificacion\/planes/, crumbs: [{ label: 'Inicio', to: '/' }, { label: 'Planificación' }, { label: 'Planes' }] },
  { pattern: /^\/planificacion\/plantilla/, crumbs: [{ label: 'Inicio', to: '/' }, { label: 'Planificación' }, { label: 'Plantilla semanal' }] },
  { pattern: /^\/planificacion\/calendario/, crumbs: [{ label: 'Inicio', to: '/' }, { label: 'Planificación' }, { label: 'Calendario' }] },
  { pattern: /^\/analisis/, crumbs: [{ label: 'Inicio', to: '/' }, { label: 'Análisis' }] },
  { pattern: /^\/profile/, crumbs: [{ label: 'Inicio', to: '/' }, { label: 'Perfil' }] },
  { pattern: /^\/configuracion/, crumbs: [{ label: 'Inicio', to: '/' }, { label: 'Configuración' }] },
]

export function Breadcrumb() {
  const { pathname } = useLocation()

  const match = ROUTE_MAP.find(({ pattern }) => pattern.test(pathname))
  if (!match || match.crumbs.length <= 1) return null

  const crumbs = match.crumbs

  return (
    <nav aria-label="Migas de pan" className="flex items-center gap-1 px-1 py-2">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-2.5 w-2.5 text-muted-foreground/50" strokeWidth={2} />}
            {crumb.to && !isLast ? (
              <Link
                to={crumb.to}
                className="text-muted-foreground hover:text-foreground transition-colors"
                style={MONO}
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                className={isLast ? 'text-foreground font-bold' : 'text-muted-foreground'}
                style={MONO}
              >
                {crumb.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
