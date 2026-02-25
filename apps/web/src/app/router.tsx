import { Routes, Route } from 'react-router-dom'

export function AppRouter() {
  return (
    <Routes>
      <Route path="*" element={<PlaceholderPage />} />
    </Routes>
  )
}

function PlaceholderPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-surface-50">
      <p className="text-surface-400 text-[15px]">
        Second Brain — ready for development
      </p>
    </div>
  )
}
