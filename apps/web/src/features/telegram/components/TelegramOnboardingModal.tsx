import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useTelegramOnboarding } from '../hooks/useTelegramOnboarding'
import { OnboardingInitial } from './OnboardingInitial'
import { OnboardingCodeDisplay } from './OnboardingCodeDisplay'
import { OnboardingConnected } from './OnboardingConnected'

export function TelegramOnboardingModal() {
  const { state, generateCode, skip } = useTelegramOnboarding()
  const [visible, setVisible] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  const isOpen = state.status !== 'checking' && state.status !== 'hidden' && state.status !== 'dismissing'

  useEffect(() => {
    if (isOpen) setVisible(true)
  }, [isOpen])

  useEffect(() => {
    if (state.status === 'dismissing') {
      const timer = setTimeout(() => setVisible(false), 200)
      return () => clearTimeout(timer)
    }
  }, [state.status])

  // Focus trap
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  if (!visible) return null

  const isDismissing = state.status === 'dismissing'
  const showCelebration = state.status === 'connected'

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex justify-center bg-surface-0/40 backdrop-blur-[8px] transition-opacity duration-200',
        isDismissing ? 'opacity-0' : 'opacity-100',
      )}
      aria-hidden={isDismissing}
    >
      {showCelebration && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full bg-ember-500 animate-[celebration-glow_400ms_ease-out]" />
        </div>
      )}

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className={cn(
          'w-[440px] max-w-[calc(100%-32px)] bg-surface-100 rounded-xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35)] self-start mt-[20vh] transition-all duration-200',
          isDismissing ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0',
        )}
      >
        {renderContent()}
      </div>
    </div>
  )

  function renderContent() {
    switch (state.status) {
      case 'initial':
        return <OnboardingInitial onGenerateCode={generateCode} onSkip={skip} isGenerating={false} />
      case 'generating':
        return <OnboardingInitial onGenerateCode={generateCode} onSkip={skip} isGenerating={true} />
      case 'code-generated':
        return <OnboardingCodeDisplay code={state.code} expiresAt={state.expiresAt} onRegenerateCode={generateCode} onSkip={skip} />
      case 'connected':
        return <OnboardingConnected username={state.username} />
      default:
        return null
    }
  }
}
