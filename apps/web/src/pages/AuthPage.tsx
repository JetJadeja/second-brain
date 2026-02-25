import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { AuthForm } from '@/features/auth'
import { ROUTES } from '@/constants/routes'

export function AuthPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
    return () => {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [])

  if (isLoading) return null

  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center px-4">
      <div className="w-full max-w-[400px] bg-surface-100 rounded-xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        <AuthForm />
      </div>
    </div>
  )
}
