import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthGuard } from '@/features/auth'
import { LandingPage } from '@/pages/LandingPage'
import { AuthPage } from '@/pages/AuthPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { InboxPage } from '@/pages/InboxPage'
import { BucketPage } from '@/pages/BucketPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'

export function AppRouter() {
  return (
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
          <Route path="/notes/:noteId" element={<PlaceholderPage title="Note Detail" />} />
          <Route path="/graph" element={<PlaceholderPage title="Graph" />} />
          <Route path="/review" element={<PlaceholderPage title="Review" />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}
