import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { PlaceholderPage } from '@/pages/PlaceholderPage'

export function AppRouter() {
  return (
    <Routes>
      {/* Public routes (no sidebar) */}
      <Route path="/" element={<PlaceholderPage title="Landing" />} />
      <Route path="/login" element={<PlaceholderPage title="Login" />} />

      {/* Authenticated routes (with sidebar layout) */}
      <Route element={<AppLayout />}>
        <Route path="/home" element={<PlaceholderPage title="Dashboard" />} />
        <Route path="/inbox" element={<PlaceholderPage title="Inbox" />} />
        <Route path="/buckets/:bucketId" element={<PlaceholderPage title="Bucket" />} />
        <Route path="/notes/:noteId" element={<PlaceholderPage title="Note Detail" />} />
        <Route path="/graph" element={<PlaceholderPage title="Graph" />} />
        <Route path="/review" element={<PlaceholderPage title="Review" />} />
        <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}
