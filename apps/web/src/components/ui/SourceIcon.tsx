import { Globe, Twitter, Camera, FileText, Mic, Brain, File } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { NoteSource } from '../../lib/types'

const sourceIcons: Record<NoteSource, { icon: LucideIcon; label: string }> = {
  article: { icon: Globe, label: 'Article' },
  tweet: { icon: Twitter, label: 'Tweet' },
  reel: { icon: Camera, label: 'Reel' },
  pdf: { icon: FileText, label: 'PDF' },
  voice_memo: { icon: Mic, label: 'Voice' },
  thought: { icon: Brain, label: 'Thought' },
  document: { icon: File, label: 'Doc' },
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
