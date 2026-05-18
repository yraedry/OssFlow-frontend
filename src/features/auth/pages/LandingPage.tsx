import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { AuthLogo } from '../components/AuthLayout'
import { GoogleLoginButton } from '../components/GoogleLoginButton'
import { Button } from '@/shared/components/ui/button'
import { MONO, SERIF, SERIF_HERO } from '@/shared/lib/typography'

const features = [
  {
    eyebrow: '01',
    title: 'Diario de entrenos',
    description: 'Registra cada sesion de BJJ y fisico con timestamps, detalles y notas de sparring. Tu historico, siempre cerca.',
  },
  {
    eyebrow: '02',
    title: 'Analisis radar',
    description: 'Visualiza tus areas fuertes y debiles: guard, passing, submissions, takedowns. Decide donde invertir mas tiempo.',
  },
  {
    eyebrow: '03',
    title: 'Catalogo de tecnicas',
    description: 'Organiza tu juego por sistemas, posiciones y tecnicas. Vincula videos, notas y conexiones entre movimientos.',
  },
  {
    eyebrow: '04',
    title: 'Planificacion semanal',
    description: 'Disena planes de estudio y calendario semanal para dominar nuevas posiciones sin perder el foco.',
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>OssFlow — Segundo cerebro para BJJ | Diario, técnicas y planificación</title>
        <meta name="description" content="Registra tus entrenamientos de BJJ, estudia técnicas, planifica tu progreso y analiza tu evolución. Todo en un solo lugar." />
        <meta property="og:title" content="OssFlow — Segundo cerebro para BJJ" />
        <meta property="og:description" content="Registra tus entrenamientos de BJJ, estudia técnicas, planifica tu progreso y analiza tu evolución." />
        <link rel="canonical" href="https://ossflow.app/landing" />
      </Helmet>
      {/* Nav superior */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <AuthLogo />
          <nav className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">Iniciar sesion</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Empezar gratis</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-24 sm:py-32 text-center">
          <p
            className="text-muted-foreground text-xs uppercase tracking-widest mb-8"
            style={MONO}
          >
            OssFlow &middot; Segundo cerebro para BJJ
          </p>

          <h1
            className="text-foreground leading-[0.95] mb-8"
            style={{ ...SERIF_HERO, fontSize: 'clamp(40px, 8vw, 80px)' }}
          >
            Domina el mat.
            <br />
            Rastrea tu evolucion.
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
            El cuaderno de entrenamiento que siempre quisiste para BJJ. Sesiones, tecnicas, analisis y
            planificacion &mdash; todo en un solo lugar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto px-10">Empezar gratis</Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-10">Ya tengo cuenta</Button>
            </Link>
          </div>

          <div className="max-w-xs mx-auto">
            <GoogleLoginButton />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <p
              className="text-muted-foreground text-xs uppercase tracking-widest mb-3"
              style={MONO}
            >
              Que incluye
            </p>
            <h2
              className="text-foreground mb-4"
              style={{ ...SERIF, fontSize: 'clamp(28px, 4vw, 44px)' }}
            >
              Todo lo que necesitas
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Herramientas disenadas especificamente para el atleta de BJJ serio.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-border">
            {features.map((f) => (
              <div
                key={f.title}
                className="border-r border-b border-border bg-card p-8 flex flex-col gap-3"
              >
                <span
                  className="text-muted-foreground text-xs uppercase tracking-widest"
                  style={MONO}
                >
                  {f.eyebrow}
                </span>
                <h3
                  className="text-foreground"
                  style={{ ...SERIF, fontSize: '20px' }}
                >
                  {f.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <p
            className="text-muted-foreground text-xs uppercase tracking-widest mb-4"
            style={MONO}
          >
            Listo para mejorar
          </p>
          <h2
            className="text-foreground mb-6"
            style={{ ...SERIF, fontSize: 'clamp(28px, 5vw, 48px)' }}
          >
            Empieza hoy. Sin tarjeta.
          </h2>
          <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
            Unete a los luchadores que ya rastrean su progreso con OssFlow.
          </p>
          <Link to="/register">
            <Button size="lg" className="px-12">Crear cuenta gratis</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <AuthLogo />
          <p
            className="text-muted-foreground text-xs uppercase tracking-widest"
            style={MONO}
          >
            &copy; {new Date().getFullYear()} OssFlow &middot; Todos los derechos reservados
          </p>
        </div>
      </footer>
    </div>
  )
}
