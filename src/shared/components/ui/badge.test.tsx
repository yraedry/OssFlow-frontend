import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './badge'

describe('Badge', () => {
  it('renders text content', () => {
    render(<Badge>Blanco</Badge>)
    expect(screen.getByText('Blanco')).toBeInTheDocument()
  })

  it('applies secondary variant class', () => {
    render(<Badge variant="secondary">Gi</Badge>)
    expect(screen.getByText('Gi')).toHaveClass('border-border')
  })

  it('applies destructive variant class', () => {
    render(<Badge variant="destructive">Error</Badge>)
    expect(screen.getByText('Error')).toHaveClass('bg-destructive')
  })

  it('applies custom className', () => {
    render(<Badge className="test-class">Tag</Badge>)
    expect(screen.getByText('Tag')).toHaveClass('test-class')
  })
})
