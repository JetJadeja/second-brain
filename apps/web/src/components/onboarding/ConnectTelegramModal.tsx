import { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { apiPost } from '../../lib/api-client'
import { useLinkStatus } from '../../hooks/use-link-status'
import type { LinkCodeResponse } from '../../lib/types'

interface ConnectTelegramModalProps {
  onDismiss: () => void
}

export function ConnectTelegramModal({ onDismiss }: ConnectTelegramModalProps) {
  const [code, setCode] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const { isLinked } = useLinkStatus()

  useEffect(() => {
    if (isLinked) onDismiss()
  }, [isLinked, onDismiss])

  const handleGenerateCode = async () => {
    const result = await apiPost<LinkCodeResponse>('/api/link/code')
    setCode(result.code)
    setExpiresAt(result.expires_at)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface rounded-lg shadow-xl max-w-md w-full mx-4 p-8">
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Connect Your Telegram Account
        </h2>
        <p className="text-sm text-text-tertiary mb-6">
          Second Brain captures content through Telegram. Link your account to get started.
        </p>

        {code ? (
          <div className="flex flex-col gap-4">
            <div className="bg-hover rounded-lg p-4 text-center">
              <p className="text-xs text-text-tertiary mb-1">Send this to the bot:</p>
              <p className="text-2xl font-mono font-bold text-text-primary tracking-widest">
                /link {code}
              </p>
            </div>
            <p className="text-xs text-text-tertiary text-center">
              {expiresAt && `Expires: ${new Date(expiresAt).toLocaleTimeString()}`}
              {' · '}Waiting for connection...
            </p>
          </div>
        ) : (
          <Button variant="primary" className="w-full" onClick={handleGenerateCode}>
            Generate Link Code
          </Button>
        )}

        <button
          type="button"
          onClick={onDismiss}
          className="mt-6 w-full text-center text-xs text-text-tertiary hover:text-text-secondary transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
