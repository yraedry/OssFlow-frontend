// Tokens tipograficos del sistema editorial OssFlow.
// Usar en lugar de duplicar inline styles en cada pagina.

export const MONO: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
}

export const MONO_LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  fontSize: '9px',
}

export const SERIF: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontWeight: 900,
  letterSpacing: '-0.02em',
}

export const SERIF_HERO: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontWeight: 900,
  letterSpacing: '-0.03em',
}
