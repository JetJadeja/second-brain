import { Globe, Twitter, MessageSquare, Camera, Image, FileText, Mic, Brain, Play, File, Paperclip } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { NoteSource } from '../../lib/types'

const sourceIcons: Record<NoteSource, { icon: LucideIcon; label: string }> = {
  article: { icon: Globe, label: 'Article' },
  tweet: { icon: Twitter, label: 'Tweet' },
  thread: { icon: MessageSquare, label: 'Thread' },
  reel: { icon: Camera, label: 'Reel' },
  image: { icon: Image, label: 'Image' },
  pdf: { icon: FileText, label: 'PDF' },
  voice_memo: { icon: Mic, label: 'Voice' },
  thought: { icon: Brain, label: 'Thought' },
  youtube: { icon: Play, label: 'YouTube' },
  document: { icon: File, label: 'Doc' },
  other: { icon: Paperclip, label: 'Other' },
}

interface SourceIconProps {
  source: NoteSource
  className?: string
}

export function SourceIcon({ source, className = '' }: SourceIconProps) {
  const { icon: Icon, label } = sourceIcons[source]
  return (
    <span className={`inline-flex items-center text-text-tertiary ${className}`} title={label}>
      <Icon size={14} />
    </span>
  )
}
