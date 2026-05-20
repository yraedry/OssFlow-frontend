import { useNavigate } from 'react-router-dom'
import { AthleteRoster } from '../components/AthleteRoster'

export function GymAlumnosPage() {
  const navigate = useNavigate()
  return <AthleteRoster onSelectAthlete={(id) => navigate(`/gimnasio/atletas/${id}`)} />
}
