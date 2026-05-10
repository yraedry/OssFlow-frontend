import { Link } from 'react-router-dom'
import { GoogleLoginButton } from '../components/GoogleLoginButton'

const features = [
  {
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
    title: 'Diario de entrenos',
    description: 'Registra cada sesión de BJJ y fisico con timestamps, detalles y notas de sparring.',
  },
  {
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
    title: 'Análisis radar',
    description: 'Visualiza tus áreas fuertes y débiles: guard, passing, submissions, takedowns.',
  },
  {
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    title: 'Catálogo de técnicas',
    description: 'Organiza tu juego por sistemas, posiciones y técnicas. Vincula vídeos y notas.',
  },
  {
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
      </svg>
    ),
    title: 'Planificación semanal',
    description: 'Diseña planes de estudio y calendario semanal para dominar nuevas posiciones.',
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-800/10 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span className="text-2xl font-black tracking-tight">
          Oss<span className="text-violet-500">Flow</span>
        </span>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm font-semibold bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors"
          >
            Empezar gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-6 pt-16 pb-24 max-w-4xl mx-auto text-center">
        {/* Label */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium tracking-widest uppercase mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Para luchadores de BJJ
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-none tracking-tight mb-6">
          Domina el mat.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
            Rastrea tu evolución.
          </span>
        </h1>

        <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          OssFlow es el cuaderno de entrenamiento que siempre quisiste. Sesiones, técnicas, análisis y
          planificación — todo en un solo lugar.
        </p>

        {/* CTA group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-lg rounded-xl transition-colors shadow-lg shadow-violet-900/40"
          >
            Empezar gratis
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 border border-white/20 hover:border-white/40 text-gray-300 hover:text-white font-semibold text-lg rounded-xl transition-colors"
          >
            Ya tengo cuenta
          </Link>
        </div>

        <div className="max-w-xs mx-auto">
          <GoogleLoginButton />
        </div>
      </section>

      {/* Geometric divider */}
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Features */}
      <section className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Todo lo que necesitas</h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Herramientas diseñadas específicamente para el atleta de BJJ serio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-violet-500/40 hover:bg-white/[0.07] transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center mb-5 group-hover:bg-violet-500/25 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      <section className="relative z-10 px-6 py-20 max-w-2xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-black mb-4">
          Listo para mejorar?
        </h2>
        <p className="text-gray-400 mb-10">
          Únete a los luchadores que ya rastrean su progreso con OssFlow.
        </p>
        <Link
          to="/register"
          className="inline-block px-10 py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold text-lg rounded-xl transition-colors shadow-lg shadow-violet-900/40"
        >
          Empezar gratis
        </Link>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-600 text-sm">
          <span className="font-bold text-gray-400">
            Oss<span className="text-violet-500">Flow</span>
          </span>
          <p>© {new Date().getFullYear()} OssFlow. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
