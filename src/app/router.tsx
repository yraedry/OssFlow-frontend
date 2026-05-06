import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { PositionsPage } from '@/features/catalog/position/pages/PositionsPage'
import { TechniquesPage } from '@/features/catalog/technique/pages/TechniquesPage'
import { NotesPage } from '@/features/journal/note/pages/NotesPage'
import { TrainingSessionsPage } from '@/features/journal/trainingsession/pages/TrainingSessionsPage'
import { StudyPlansPage } from '@/features/planning/studyplan/pages/StudyPlansPage'
import { StudyPlanDetailPage } from '@/features/planning/studyplan/pages/StudyPlanDetailPage'
import { ProfilePage } from '@/features/identity/profile/pages/ProfilePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'catalog/positions', element: <PositionsPage /> },
      { path: 'catalog/techniques', element: <TechniquesPage /> },
      { path: 'journal/notes', element: <NotesPage /> },
      { path: 'journal/training-sessions', element: <TrainingSessionsPage /> },
      { path: 'planning/study-plans', element: <StudyPlansPage /> },
      { path: 'planning/study-plans/:id', element: <StudyPlanDetailPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
  { path: '/onboarding', element: <OnboardingPage /> },
  { path: '*', element: <NotFoundPage /> },
])
