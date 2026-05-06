import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Calendar, MapPin, Weight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { Badge } from '@/shared/components/ui/badge'
import { Spinner } from '@/shared/components/ui/spinner'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { MatchCard } from '@/features/competition/match/components/MatchCard'
import { MatchForm } from '@/features/competition/match/components/MatchForm'
import { useCompetitionMatches, useCreateCompetitionMatch, useDeleteCompetitionMatch } from '@/features/competition/match/hooks'
import { useCompetitionLog } from '../hooks'
import type { CreateMatchForm } from '@/features/competition/match/schemas'

export function CompetitionLogDetailPage() {
  const { id } = useParams<{ id: string }>()
  const logId = Number(id)
  const navigate = useNavigate()
  const [matchDialogOpen, setMatchDialogOpen] = useState(false)

  const { data: log, isLoading: logLoading, error: logError } = useCompetitionLog(logId)
  const { data: matches, isLoading: matchesLoading } = useCompetitionMatches(logId)
  const createMatch = useCreateCompetitionMatch(logId)
  const deleteMatch = useDeleteCompetitionMatch(logId)

  const handleAddMatch = async (data: CreateMatchForm) => {
    await createMatch.mutateAsync(data)
    setMatchDialogOpen(false)
  }

  const handleDeleteMatch = async (matchId: number) => {
    if (!confirm('¿Eliminar este match?')) return
    await deleteMatch.mutateAsync(matchId)
  }

  if (logLoading) return <div className="flex justify-center p-8"><Spinner /></div>
  if (logError || !log)
    return (
      <Alert variant="destructive">
        <AlertDescription>Error al cargar la competencia</AlertDescription>
      </Alert>
    )

  const matchList = matches ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/competition/logs')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">{log.eventName}</h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(log.eventDate), 'd MMM yyyy', { locale: es })}
            </span>
            {log.location && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {log.location}
              </span>
            )}
            {log.weightClass && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Weight className="h-3.5 w-3.5" />
                {log.weightClass}
              </span>
            )}
            <Badge variant="secondary">{log.modality}</Badge>
          </div>
          {log.result && (
            <p className="text-sm font-medium mt-1">{log.result}</p>
          )}
          {log.notes && (
            <p className="text-sm text-muted-foreground mt-1">{log.notes}</p>
          )}
        </div>
        <Dialog open={matchDialogOpen} onOpenChange={setMatchDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Match
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo match</DialogTitle>
            </DialogHeader>
            <MatchForm onSubmit={handleAddMatch} isPending={createMatch.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">
          Matches ({matchList.length})
        </h2>
        {matchesLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : matchList.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No hay matches registrados.</p>
            <p className="text-sm">Añade tu primer match con el botón de arriba.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matchList.map((match) => (
              <MatchCard key={match.id} match={match} onDelete={handleDeleteMatch} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
