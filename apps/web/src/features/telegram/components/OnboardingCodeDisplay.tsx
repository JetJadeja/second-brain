import { useState, useCallback } from 'react'
import { Clipboard, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToastStore } from '@/stores/toast.store'
import { useExpirationCountdown } from '../hooks/useExpirationCountdown'

type OnboardingCodeDisplayProps = {
  code: string
  expiresAt: string
  onRegenerateCode: () => void
  onSkip: () => void
}

export function OnboardingCodeDisplay({
  code,
  expiresAt,
  onRegenerateCode,
  onSkip,
}: OnboardingCodeDisplayProps) {
  const [copied, setCopied] = useState(false)
  const { timeLeft, isExpired, isUrgent } = useExpirationCountdown(expiresAt)
  const toast = useToastStore((s) => s.toast)
  const fullCode = `/link ${code}`

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(fullCode)
    setCopied(true)
    toast({ type: 'success', message: 'Copied to clipboard' })
    setTimeout(() => setCopied(false), 2000)
  }, [fullCode, toast])

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-full bg-surface-150 rounded-lg p-4 mt-5">
        <p className="font-caption text-surface-300">Send this to the bot:</p>

        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="font-mono text-2xl font-bold text-surface-800 tracking-[0.15em]">
            {fullCode.split('').map((char, i) => (
              <span
                key={i}
                className="inline-block animate-[char-stagger_150ms_ease-out_both]"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </span>

          <button
            onClick={handleCopy}
            aria-label="Copy link code to clipboard"
            className="p-1 text-surface-400 hover:text-surface-500 transition-colors"
          >
            {copied ? (
              <Check size={14} className="text-success animate-[copy-bounce_200ms_ease-out]" />
            ) : (
              <Clipboard size={14} />
            )}
          </button>
        </div>

        <p className={cn(
          'mt-3 font-caption',
          isExpired ? 'text-danger' : isUrgent ? 'text-status-keypoints' : 'text-surface-300',
        )}>
          {isExpired ? (
            <>
              Code expired{' '}
              <button onClick={onRegenerateCode} className="text-ember-500 hover:text-ember-600 transition-colors">
                Generate new code
              </button>
            </>
          ) : (
            `Expires in ${timeLeft}`
          )}
        </p>
      </div>

      <p className="mt-2 font-body-sm text-surface-300 animate-[waiting-pulse_1.5s_ease-in-out_infinite]">
        Waiting for connection…
      </p>

      <button
        onClick={onSkip}
        className="mt-4 font-body-sm text-surface-300 hover:text-surface-400 transition-colors cursor-pointer"
      >
        Skip for now
      </button>
    </div>
  )
}
