import { Send } from 'lucide-react'
import { useExpirationCountdown } from '@/features/telegram/hooks/useExpirationCountdown'
import { useTelegramSettings } from '../hooks/useTelegramSettings'

function CodeDisplay({ code, expiresAt, onRegenerate }: { code: string; expiresAt: string; onRegenerate: () => void }) {
  const { timeLeft, isExpired, isUrgent } = useExpirationCountdown(expiresAt)

  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-lg bg-surface-150 p-4 text-center">
        <p className="text-[10px] font-medium tracking-wider text-surface-300">Send this to the bot:</p>
        <p className="mt-2 font-mono text-2xl font-bold tracking-[0.2em] text-surface-800">/link {code}</p>
      </div>
      <p className={`text-center text-[10px] ${isExpired ? 'text-danger' : isUrgent ? 'text-warning' : 'text-surface-300'}`}>
        {isExpired ? 'Code expired' : `Expires in ${timeLeft}`}
        {isExpired && (
          <button type="button" onClick={onRegenerate} className="ml-2 text-ember-500 hover:underline">
            Generate new code
          </button>
        )}
      </p>
      <p className="text-center text-sm text-surface-400">Send <span className="font-mono">/link {code}</span> to @SecondBrainBot on Telegram</p>
    </div>
  )
}

export function TelegramSettingsCard() {
  const { state, confirmingDisconnect, generateCode, disconnect } = useTelegramSettings()

  return (
    <div className="rounded-xl border border-surface-200 bg-surface-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Send className="size-4 text-surface-400" />
        <h2 className="text-[15px] font-semibold text-surface-700">Telegram</h2>
      </div>

      {state.status === 'checking' && (
        <p className="text-sm text-surface-400">Checking connection...</p>
      )}

      {state.status === 'connected' && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="size-5 text-[#229ED9]" />
            <span className="text-[15px] text-surface-500">Connected as @{state.username ?? 'unknown'}</span>
          </div>
          <button
            type="button"
            onClick={disconnect}
            className="rounded-md px-3 py-1 text-[13px] font-medium text-danger hover:bg-danger/10 transition-colors"
          >
            {confirmingDisconnect ? 'Confirm disconnect?' : 'Disconnect'}
          </button>
        </div>
      )}

      {state.status === 'disconnected' && (
        <div>
          <p className="text-sm text-surface-400">Connect your Telegram to capture notes on the go.</p>
          <button
            type="button"
            onClick={generateCode}
            className="mt-4 w-full rounded-lg bg-ember-500 py-2.5 text-sm font-semibold text-white hover:bg-ember-600 transition-colors"
          >
            Generate Link Code
          </button>
        </div>
      )}

      {state.status === 'generating' && (
        <p className="text-sm text-surface-400">Generating code...</p>
      )}

      {state.status === 'code-generated' && (
        <CodeDisplay code={state.code} expiresAt={state.expiresAt} onRegenerate={generateCode} />
      )}
    </div>
  )
}
