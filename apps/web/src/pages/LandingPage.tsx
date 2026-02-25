import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain } from 'lucide-react'
import { TypingAnimation } from '@/features/landing/components/TypingAnimation'
import { ROUTES } from '@/constants/routes'

export function LandingPage() {
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
    return () => {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [])

  return (
    <div className="h-screen bg-surface-0 flex flex-col items-center justify-center relative">
      <div className="flex flex-col items-center text-center">
        <Brain
          size={64}
          className="text-transparent"
          style={{ stroke: 'url(#ember-gradient)' }}
        />
        <svg className="absolute w-0 h-0" aria-hidden="true">
          <defs>
            <linearGradient id="ember-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EE4540" />
              <stop offset="100%" stopColor="#801336" />
            </linearGradient>
          </defs>
        </svg>

        <h1 className="mt-4 font-display text-surface-800">Second Brain</h1>

        <div className="mt-6 h-8">
          <TypingAnimation />
        </div>

        <p className="mt-8 font-body-lg text-surface-400 max-w-[520px] leading-relaxed">
          Capture anything through Telegram. Retrieve it instantly with AI-powered search.
          Synthesize your accumulated knowledge into new thinking.
        </p>

        <button
          onClick={() => navigate(ROUTES.LOGIN)}
          className="mt-8 w-[200px] h-12 rounded-lg font-body font-semibold text-white bg-gradient-to-br from-ember-500 to-ember-700 hover:from-ember-400 hover:to-ember-600 active:scale-[0.98] transition-all duration-200 animate-[cta-glow_3s_linear_infinite]"
        >
          Get Started
        </button>
      </div>

      <footer className="absolute bottom-8 text-center">
        <span className="font-caption text-surface-300">Built by Jet Jadeja</span>
      </footer>
    </div>
  )
}
