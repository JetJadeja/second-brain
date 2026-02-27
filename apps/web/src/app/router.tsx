import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthGuard } from '@/features/auth'
import { RouteErrorBoundary } from '@/components/shared/RouteErrorBoundary'

const LandingPage = lazy(() => import('@/pages/LandingPage').then((m) => ({ default: m.LandingPage })))
const AuthPage = lazy(() => import('@/pages/AuthPage').then((m) => ({ default: m.AuthPage })))
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const InboxPage = lazy(() => import('@/pages/InboxPage').then((m) => ({ default: m.InboxPage })))
const BucketPage = lazy(() => import('@/pages/BucketPage').then((m) => ({ default: m.BucketPage })))
const NoteDetailPage = lazy(() => import('@/pages/NoteDetailPage').then((m) => ({ default: m.NoteDetailPage })))
const GraphPage = lazy(() => import('@/pages/GraphPage').then((m) => ({ default: m.GraphPage })))
const ReviewPage = lazy(() => import('@/pages/ReviewPage').then((m) => ({ default: m.ReviewPage })))
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })))

function PageFallback() {
  return <div className="flex h-full items-center justify-center text-surface-400">Loading...</div>
}

export function AppRouter() {
  return (
    <RouteErrorBoundary>
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public routes (no sidebar) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />

        {/* Authenticated routes (with sidebar layout) */}
        <Route element={<AuthGuard />}>
          <Route element={<AppLayout />}>
            <Route path="/home" element={<DashboardPage />} />
            <Route path="/inbox" element={<InboxPage />} />
            <Route path="/buckets/:bucketId" element={<BucketPage />} />
            <Route path="/notes/:noteId" element={<NoteDetailPage />} />
            <Route path="/graph" element={<GraphPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Suspense>
    </RouteErrorBoundary>
  )
}
