import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type OnboardingInitialProps = {
  onGenerateCode: () => void
  onSkip: () => void
  isGenerating: boolean
}

export function OnboardingInitial({ onGenerateCode, onSkip, isGenerating }: OnboardingInitialProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <Send size={32} className="text-[#229ED9]" />

      <h2 id="onboarding-title" className="mt-4 font-title-md text-surface-700">
        Connect Telegram
      </h2>

      <p className="mt-3 font-body text-surface-400 max-w-[360px]">
        Your Second Brain captures content through Telegram. Connect your account to start
        sending articles, tweets, thoughts, and anything else.
      </p>

      <button
        onClick={onGenerateCode}
        disabled={isGenerating}
        className={cn(
          'w-full h-11 mt-5 rounded-md font-body font-semibold text-white transition-colors duration-[120ms]',
          'bg-ember-500 hover:bg-ember-600 active:bg-ember-700 active:scale-[0.98]',
          'disabled:opacity-60 disabled:cursor-not-allowed',
        )}
      >
        {isGenerating ? <Loader2 size={16} className="mx-auto animate-spin" /> : 'Generate Link Code'}
      </button>

      <button
        onClick={onSkip}
        className="mt-4 font-body-sm text-surface-300 hover:text-surface-400 transition-colors cursor-pointer"
      >
        Skip for now
      </button>
    </div>
  )
}
