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
  background: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: '6px',
  fontSize: '11px',
  fontFamily: 'var(--font-mono)',
  color: '#e2e8f0',
  padding: '6px 10px',
}
