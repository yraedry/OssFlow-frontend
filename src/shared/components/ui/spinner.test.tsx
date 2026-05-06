import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Spinner } from './spinner'

describe('Spinner', () => {
  it('renders with accessible label', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('has aria-label Cargando', () => {
    render(<Spinner />)
    expect(screen.getByLabelText('Cargando')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Spinner className="custom-class" />)
    expect(screen.getByRole('status')).toHaveClass('custom-class')
  })
})
