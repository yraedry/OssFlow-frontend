import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { AuthGuard } from './AuthGuard'
import { OnboardingGuard } from './OnboardingGuard'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { PositionsPage } from '@/features/catalog/position/pages/PositionsPage'
import { TechniquesPage } from '@/features/catalog/technique/pages/TechniquesPage'
import { TechniqueDetailPage } from '@/features/catalog/technique/pages/TechniqueDetailPage'
import { NotesPage } from '@/features/journal/note/pages/NotesPage'
import { TrainingSessionsPage } from '@/features/journal/trainingsession/pages/TrainingSessionsPage'
import { PhysicalSessionsPage } from '@/features/journal/physicalsession/pages/PhysicalSessionsPage'
import { StudyPlansPage } from '@/features/planning/studyplan/pages/StudyPlansPage'
import { StudyPlanDetailPage } from '@/features/planning/studyplan/pages/StudyPlanDetailPage'
import { StudyPlanTimelinePage } from '@/features/planning/studyplan/pages/StudyPlanTimelinePage'
import { WeeklyTemplatePage } from '@/features/planning/weeklytemplate/pages/WeeklyTemplatePage'
import { ProfilePage } from '@/features/identity/profile/pages/ProfilePage'
import { CompetitionLogsPage } from '@/features/competition/log/pages/CompetitionLogsPage'
import { CompetitionLogDetailPage } from '@/features/competition/log/pages/CompetitionLogDetailPage'
import { SystemsPage } from '@/features/catalog/system/pages/SystemsPage'
import { NoteGraphPage } from '@/features/journal/note/pages/NoteGraphPage'
import { SystemEditorPage } from '@/features/catalog/system/components/editor/SystemEditorPage'
import { ExportPage } from '@/features/export/pages/ExportPage'
import { TrashPage } from '@/features/trash/pages/TrashPage'
import { RulesetsPage } from '@/features/catalog/ruleset/pages/RulesetsPage'
import { Spinner } from '@/shared/components/ui/spinner'

const lazySuspense = (element: React.ReactNode) => (
  <React.Suspense fallback={<div className="flex items-center justify-center h-full"><Spinner /></div>}>
    {element}
  </React.Suspense>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthGuard />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'catalog/positions', element: <PositionsPage /> },
          { path: 'catalog/techniques', element: <TechniquesPage /> },
          { path: 'catalog/techniques/:id', element: <TechniqueDetailPage /> },
          { path: 'catalog/systems', element: <SystemsPage /> },
          { path: 'catalog/systems/:id/edit', element: lazySuspense(<SystemEditorPage />) },
          { path: 'catalog/rulesets', element: <RulesetsPage /> },
          { path: 'journal/notes', element: <NotesPage /> },
          { path: 'journal/graph', element: lazySuspense(<NoteGraphPage />) },
          { path: 'journal/training-sessions', element: <TrainingSessionsPage /> },
          { path: 'journal/physical-sessions', element: <PhysicalSessionsPage /> },
          { path: 'planning/study-plans', element: <StudyPlansPage /> },
          { path: 'planning/study-plans/:id', element: <StudyPlanDetailPage /> },
          { path: 'planning/study-plans/:id/timeline', element: <StudyPlanTimelinePage /> },
          { path: 'planning/weekly-template', element: <WeeklyTemplatePage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'competition/logs', element: <CompetitionLogsPage /> },
          { path: 'competition/logs/:id', element: <CompetitionLogDetailPage /> },
          { path: 'export', element: <ExportPage /> },
          { path: 'trash', element: <TrashPage /> },
        ],
      },
    ],
  },
  {
    path: '/onboarding',
    element: <OnboardingGuard />,
    children: [{ index: true, element: <OnboardingPage /> }],
  },
  { path: '*', element: <NotFoundPage /> },
])
