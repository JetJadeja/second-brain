import { Search, Paperclip, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

export type LoadingStep = 'searching' | 'found' | 'synthesizing' | 'done'

export type AskLoadingStepsProps = {
  step: LoadingStep
  noteCount?: number
}

const STEPS: {
  key: LoadingStep
  icon: React.ReactNode
  text: (count?: number) => string
}[] = [
  {
    key: 'searching',
    icon: <Search size={16} />,
    text: () => 'Searching your knowledge base…',
  },
  {
    key: 'found',
    icon: <Paperclip size={16} />,
    text: (count) => `Found ${count ?? 0} relevant notes`,
  },
  {
    key: 'synthesizing',
    icon: <Brain size={16} />,
    text: (count) => `Synthesizing across ${count ?? 0} sources…`,
  },
]

const STEP_ORDER: LoadingStep[] = ['searching', 'found', 'synthesizing']

function stepIndex(step: LoadingStep): number {
  return STEP_ORDER.indexOf(step)
}

export function AskLoadingSteps({ step, noteCount }: AskLoadingStepsProps) {
  const currentIndex = stepIndex(step)
  const progressPercent = step === 'done' ? 100 : ((currentIndex + 1) / STEP_ORDER.length) * 80

  return (
    <div className="p-4 space-y-2">
      {STEPS.map((s, i) => {
        const isActive = i <= currentIndex
        const isCurrent = i === currentIndex
        if (!isActive) return null

        return (
          <div
            key={s.key}
            className={cn(
              'flex items-center gap-2 animate-[fade-in_200ms_ease-out]',
              isCurrent ? 'text-surface-500' : 'text-surface-300',
            )}
            style={{ animationDelay: `${i * 200}ms`, animationFillMode: 'both' }}
          >
            <span className={cn('shrink-0', isCurrent && s.key === 'synthesizing' && 'animate-pulse-subtle')}>
              {s.icon}
            </span>
            <span className="font-body-sm">{s.text(noteCount)}</span>
          </div>
        )
      })}

      <div className="h-0.5 w-full bg-surface-200 rounded-full overflow-hidden mt-3">
        <div
          className="h-full bg-ember-500 rounded-full transition-[width] duration-1000 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}
