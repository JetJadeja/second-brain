import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/auth-store'
import { useAuthListener } from './hooks/use-auth-listener'
import { useSystemThemeListener } from './hooks/use-system-theme-listener'
import { AppShell } from './components/layout/AppShell'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Home from './pages/Home'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const session = useAuthStore((s) => s.session)
  const initializing = useAuthStore((s) => s.initializing)

  if (initializing) return null
  if (!session) return <Navigate to="/login" replace />
  return <AppShell>{children}</AppShell>
}

export default function App() {
  useAuthListener()
  useSystemThemeListener()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
