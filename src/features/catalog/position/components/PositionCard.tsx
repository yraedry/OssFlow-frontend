import type { Position } from '../types'

interface Props {
  position: Position
}

export function PositionCard({ position }: Props) {
  return <div>{position.name}</div>
}
