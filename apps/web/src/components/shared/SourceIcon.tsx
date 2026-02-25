import {
  Brain,
  Camera,
  File,
  FileText,
  Globe,
  Image,
  Mic,
  Play,
  Twitter,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NoteSource } from '@/types/enums'

const SOURCE_ICON_MAP: Record<NoteSource, LucideIcon> = {
  article: Globe,
  tweet: Twitter,
  thread: Twitter,
  reel: Camera,
  image: Image,
  pdf: FileText,
  voice_memo: Mic,
  thought: Brain,
  youtube: Play,
  document: File,
  other: File,
}

export type SourceIconProps = {
  sourceType: NoteSource
  size?: number
  className?: string
}

const SOURCE_LABELS: Record<NoteSource, string> = {
  article: 'Article',
  tweet: 'Tweet',
  thread: 'Thread',
  reel: 'Reel',
  image: 'Image',
  pdf: 'PDF',
  voice_memo: 'Voice memo',
  thought: 'Thought',
  youtube: 'YouTube',
  document: 'Document',
  other: 'File',
}

export function SourceIcon({ sourceType, size = 16, className }: SourceIconProps) {
  const Icon = SOURCE_ICON_MAP[sourceType] ?? File
  return <Icon size={size} className={cn('text-surface-400', className)} aria-label={SOURCE_LABELS[sourceType] ?? 'File'} role="img" />
}
