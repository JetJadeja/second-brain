import { Send, Check } from 'lucide-react'

type OnboardingConnectedProps = {
  username: string | null
}

export function OnboardingConnected({ username }: OnboardingConnectedProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        <Send size={32} className="text-[#229ED9]" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
          <Check size={10} className="text-white" strokeWidth={3} />
        </div>
      </div>

      <h2 className="mt-4 font-title-md text-surface-700">
        {username ? `Connected as @${username}` : 'Connected'}
      </h2>
    </div>
  )
}
