import { Check } from 'lucide-react'
import type { InboxItem } from '../../lib/types'
import { Card } from '../ui/Card'
import { SourceIcon } from '../ui/SourceIcon'
import { Chip } from '../ui/Chip'
import { Button } from '../ui/Button'

interface InboxCardProps {
  item: InboxItem
  onConfirm: (id: string) => void
  onChange: (id: string) => void
}

export function InboxCard({ item, onConfirm, onChange }: InboxCardProps) {
  return (
    <Card className="flex-shrink-0 w-72 p-4">
      <div className="flex items-center gap-2 mb-2">
        <SourceIcon source={item.sourceType} />
        <span className="text-sm font-medium text-text-primary truncate">{item.title}</span>
      </div>
      <p className="text-xs text-text-tertiary mb-3 line-clamp-2">{item.summary}</p>
      <Chip label={item.suggestedBucket} className="mb-3" />
      <div className="flex gap-2">
        <Button variant="primary" className="text-xs px-3 py-1 inline-flex items-center gap-1" onClick={() => onConfirm(item.id)}>
          <Check size={12} />
          Confirm
        </Button>
        <Button variant="secondary" className="text-xs px-3 py-1" onClick={() => onChange(item.id)}>
          Change
        </Button>
      </div>
    </Card>
  )
}
