import { Lightbulb, Check, X } from 'lucide-react'
import { useState } from 'react'
import type { SuggestionItem } from '../../lib/types'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { apiPost } from '../../lib/api-client'
import { useQueryClient } from '@tanstack/react-query'
import { useToastStore } from '../../stores/toast-store'

interface SuggestionCardProps {
  suggestion: SuggestionItem
  onActionComplete: () => void
}

export function SuggestionCard({ suggestion, onActionComplete }: SuggestionCardProps) {
  const queryClient = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)
  const [loading, setLoading] = useState(false)

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['inbox'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      queryClient.invalidateQueries({ queryKey: ['para-tree'] }),
    ])
  }

  const handleAccept = async () => {
    setLoading(true)
    try {
      await apiPost(`/api/suggestions/${suggestion.id}/accept`)
      await invalidateAll()
      addToast('Suggestion accepted')
      onActionComplete()
    } catch {
      addToast('Failed to accept suggestion', { label: 'Retry', onClick: handleAccept })
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = async () => {
    setLoading(true)
    try {
      await apiPost(`/api/suggestions/${suggestion.id}/dismiss`)
      await invalidateAll()
      addToast('Suggestion dismissed')
      onActionComplete()
    } catch {
      addToast('Failed to dismiss suggestion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb size={16} className="text-yellow-500" />
        <span className="text-xs font-medium text-text-tertiary uppercase">Suggestion</span>
      </div>
      <p className="text-sm text-text-primary mb-4">{suggestion.description}</p>
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          className="text-sm px-4 py-2 inline-flex items-center gap-2"
          onClick={handleAccept}
          disabled={loading}
        >
          <Check size={14} />
          Accept
        </Button>
        <Button
          variant="secondary"
          className="text-sm px-4 py-2 inline-flex items-center gap-2"
          onClick={handleDismiss}
          disabled={loading}
        >
          <X size={14} />
          Dismiss
        </Button>
      </div>
    </Card>
  )
}
