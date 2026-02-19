import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth-store'
import { useForceLightMode } from '../hooks/use-force-light-mode'
import { AuthInput } from '../components/auth/AuthInput'
import { Button } from '../components/ui/Button'

export default function Login() {
  useForceLightMode()
  const session = useAuthStore((s) => s.session)
  const initializing = useAuthStore((s) => s.initializing)
  const signIn = useAuthStore((s) => s.signIn)
  const signUp = useAuthStore((s) => s.signUp)

  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (initializing) return null
  if (session) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      if (isLogin) {
        const result = await signIn(email, password)
        if (result.error) setError(result.error)
      } else {
        const result = await signUp(email, password)
        if (result.error) {
          setError(result.error)
        } else {
          setIsLogin(true)
          setEmail('')
          setPassword('')
        }
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleMode = () => {
    setIsLogin((prev) => !prev)
    setError(null)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-mono">
      <div className="w-full max-w-sm p-8 bg-white rounded shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-700">
          {isLogin ? 'Log In' : 'Sign Up'}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <AuthInput
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            required
          />
          <AuthInput
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button type="submit" variant="auth" disabled={submitting} className="w-full mt-2">
            {submitting ? 'Processing...' : isLogin ? 'Log In' : 'Sign Up'}
          </Button>
        </form>
        <p className="mt-6 text-xs text-center text-gray-600">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button type="button" onClick={toggleMode} className="text-blue-500 hover:underline">
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  )
}
