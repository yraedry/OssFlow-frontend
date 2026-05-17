export type SectionId = 'guardias' | 'sumisiones' | 'pasajes' | 'derribos' | 'fisico' | 'coach'
export type DataSource = 'bjj' | 'fisico' | 'coach'

export interface Section {
  id: SectionId
  label: string
  color: string
  source: DataSource
  families: string[]
  title: string
  subtitle: string
  emptyHint: string
}

export const TOOLTIP_STYLE = {
  background: 'var(--background)',
  border: '1px solid var(--border)',
  borderRadius: '4px',
  fontSize: '11px',
  fontFamily: 'var(--font-mono)',
  color: 'var(--foreground)',
  padding: '6px 10px',
}
