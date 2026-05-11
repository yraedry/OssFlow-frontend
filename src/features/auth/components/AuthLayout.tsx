import { Link } from 'react-router-dom'
import { MONO, SERIF } from '@/shared/lib/typography'

export function AuthLogo() {
  return (
    <Link to="/landing" className="inline-flex items-center gap-2 group">
      <svg width="22" height="22" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="text-foreground">
        <rect x="6" y="29" width="68" height="22" fill="currentColor"/>
        <rect x="34" y="19" width="12" height="42" fill="currentColor"/>
        <rect x="37" y="22" width="6" height="36" fill="var(--color-background)"/>
        <rect x="6" y="39" width="28" height="3" fill="var(--color-background)"/>
        <rect x="46" y="39" width="28" height="3" fill="var(--color-background)"/>
        <rect x="30" y="51" width="8" height="13" fill="currentColor"/>
        <rect x="42" y="51" width="8" height="13" fill="currentColor"/>
      </svg>
      <span style={SERIF} className="text-lg text-foreground">OssFlow</span>
    </Link>
  )
}

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  maxWidth?: string
}

export function AuthLayout({ title, subtitle, children, maxWidth = 'max-w-sm' }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className={`w-full ${maxWidth}`}>
        <div className="mb-8 flex flex-col items-center gap-4">
          <AuthLogo />
          <div className="text-center">
            <h1 className="text-foreground" style={{ ...SERIF, fontSize: '22px' }}>{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground mt-1.5 text-xs uppercase tracking-widest" style={MONO}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

interface AuthFieldProps {
  label: string
  htmlFor?: string
  error?: string
  children: React.ReactNode
}

// S3.13: htmlFor prop para asociar el label con el input hijo (accesibilidad).
export function AuthField({ label, htmlFor, error, children }: AuthFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-xs uppercase tracking-widest text-muted-foreground" style={MONO}>
        {label}
      </label>
      {children}
      {error && <p className="text-destructive text-xs" style={MONO}>{error}</p>}
    </div>
  )
}

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-border bg-card p-8 space-y-5">
      {children}
    </div>
  )
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 border-t border-border" />
      <span className="text-muted-foreground text-xs uppercase tracking-widest shrink-0" style={MONO}>{label}</span>
      <div className="flex-1 border-t border-border" />
    </div>
  )
}

export function AuthLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="text-foreground hover:text-muted-foreground transition-colors underline underline-offset-2 text-xs" style={MONO}>
      {children}
    </Link>
  )
}
