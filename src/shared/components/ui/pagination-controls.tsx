interface PaginationControlsProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function PaginationControls({ page, totalPages, onPageChange }: PaginationControlsProps) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-4 pt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="px-3 py-1.5 text-xs font-mono rounded border border-border hover:border-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ← Anterior
      </button>
      <span className="text-xs text-muted-foreground font-mono">
        Página {page + 1} de {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="px-3 py-1.5 text-xs font-mono rounded border border-border hover:border-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Siguiente →
      </button>
    </div>
  )
}
