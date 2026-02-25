import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { apiPost, apiDelete } from '../../lib/api-client'
import type { LinkCodeResponse } from '../../lib/types'
import { useLinkStatus } from '../../hooks/use-link-status'

export function TelegramLink() {
  const [code, setCode] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const { isLinked, username } = useLinkStatus()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (isLinked) setCode(null)
  }, [isLinked])

  const handleGenerateCode = async () => {
    const result = await apiPost<LinkCodeResponse>('/api/link/code')
    setCode(result.code)
    setExpiresAt(result.expires_at)
  }

  const handleDisconnect = async () => {
    await apiDelete('/api/link')
    await queryClient.invalidateQueries({ queryKey: ['link-status'] })
  }

  if (isLinked) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-2">Telegram</h2>
        <p className="text-sm text-text-secondary mb-4">
          Connected as <span className="font-medium">@{username}</span>
        </p>
        <Button variant="secondary" className="text-sm text-red-500" onClick={handleDisconnect}>
          Disconnect
        </Button>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-2">Connect Telegram</h2>
      <p className="text-sm text-text-tertiary mb-4">
        Link your Telegram account to capture content directly from your messages.
      </p>

      {code ? (
        <div className="flex flex-col gap-4">
          <div className="bg-hover rounded-lg p-4 text-center">
            <p className="text-xs text-text-tertiary mb-1">Send this to the bot:</p>
            <p className="text-2xl font-mono font-bold text-text-primary tracking-widest">/link {code}</p>
          </div>
          <p className="text-xs text-text-tertiary text-center">
            {expiresAt && `Expires: ${new Date(expiresAt).toLocaleTimeString()}`}
            {' · '}Waiting for connection...
          </p>
        </div>
      ) : (
        <Button variant="primary" onClick={handleGenerateCode}>
          Generate Link Code
        </Button>
      )}
    </Card>
  )
}
