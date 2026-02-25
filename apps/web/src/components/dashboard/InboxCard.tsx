import { Check } from 'lucide-react'
import type { DashboardInboxItem } from '../../lib/types'
import { formatRelativeTime, formatFullDate } from '../../lib/format-time'
import { Card } from '../ui/Card'
import { SourceIcon } from '../ui/SourceIcon'
import { Chip } from '../ui/Chip'
import { Button } from '../ui/Button'

interface InboxCardProps {
  item: DashboardInboxItem
  onConfirm: (id: string) => void
  onChange: (id: string) => void
  disabled?: boolean
}

export function InboxCard({ item, onConfirm, onChange, disabled }: InboxCardProps) {
  return (
    <Card className="flex-shrink-0 w-72 p-4">
      <div className="flex items-center gap-2 mb-2">
        <SourceIcon source={item.source_type} />
        <span className="text-sm font-medium text-text-primary truncate">{item.title}</span>
      </div>
      <p className="text-xs text-text-tertiary mb-2 line-clamp-2">{item.ai_summary}</p>
      <span className="text-xs text-text-tertiary mb-3 block" title={formatFullDate(item.captured_at)}>
        {formatRelativeTime(item.captured_at)}
      </span>
      {item.ai_suggested_bucket_path && (
        <Chip label={item.ai_suggested_bucket_path} truncate className="mb-3" />
      )}
      <div className="flex gap-2">
        <Button variant="primary" className="text-xs px-3 py-1 inline-flex items-center gap-1" onClick={() => onConfirm(item.id)} disabled={disabled}>
          <Check size={12} />
          Confirm
        </Button>
        <Button variant="secondary" className="text-xs px-3 py-1" onClick={() => onChange(item.id)} disabled={disabled}>
          Change
        </Button>
      </div>
    </Card>
  )
}
