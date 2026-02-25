import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import * as authService from '../services/auth.service'
import { AuthInput } from './AuthInput'

type AuthMode = 'login' | 'signup'

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shakeError, setShakeError] = useState(false)

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const result = mode === 'login'
      ? await authService.signIn(email, password)
      : await authService.signUp(email, password)

    setIsSubmitting(false)

    if (!result.success && result.error) {
      setError(result.error)
      setShakeError(true)
      setTimeout(() => setShakeError(false), 300)
    }
  }

  const isLogin = mode === 'login'

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="font-title-md text-surface-700">
        {isLogin ? 'Welcome back' : 'Create your brain'}
      </h1>

      <div className="flex gap-4 mt-3">
        <ModeTab label="Log in" active={isLogin} onClick={() => setMode('login')} />
        <ModeTab label="Sign up" active={!isLogin} onClick={() => setMode('signup')} />
      </div>

      <div className="mt-5 space-y-4">
        <AuthInput label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" hasError={!!error} shake={shakeError} />
        <AuthInput label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" hasError={!!error} shake={shakeError} />
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-3 text-danger font-body-sm animate-[fade-in_150ms_ease-out]">
          <AlertTriangle size={14} />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          'w-full h-11 mt-5 rounded-md font-body font-semibold text-white transition-colors duration-[120ms]',
          'bg-ember-500 hover:bg-ember-600 active:bg-ember-700 active:scale-[0.98]',
          'disabled:opacity-60 disabled:cursor-not-allowed',
        )}
      >
        {isSubmitting ? <Loader2 size={16} className="mx-auto animate-spin" /> : isLogin ? 'Log in' : 'Sign up'}
      </button>

      <p className="mt-4 text-center font-body-sm text-surface-400">
        {isLogin ? "Don't have an account? " : 'Already have an account? '}
        <button
          type="button"
          onClick={() => setMode(isLogin ? 'signup' : 'login')}
          className="text-ember-500 hover:text-ember-600 transition-colors"
        >
          {isLogin ? 'Sign up' : 'Log in'}
        </button>
      </p>
    </form>
  )
}

function ModeTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'pb-1 font-body-sm transition-all duration-150 border-b-2',
        active ? 'text-surface-700 border-ember-500' : 'text-surface-400 border-transparent hover:text-surface-500',
      )}
    >
      {label}
    </button>
  )
}
