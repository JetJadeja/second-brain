import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { KeyboardBadge } from '@/components/shared/KeyboardBadge'
import { useCommandPaletteStore } from '@/stores/command-palette.store'
import { useSidebarStore } from '@/stores/sidebar.store'
import type { PaletteCommand } from '../types/command-palette.types'

const COMMANDS: PaletteCommand[] = [
  { id: 'inbox', label: '/inbox', description: 'Go to inbox', shortcut: '⌘2' },
  { id: 'graph', label: '/graph', description: 'Open graph view', shortcut: '⌘4' },
  { id: 'review', label: '/review', description: 'Start weekly review', shortcut: '⌘5' },
  { id: 'new', label: '/new', description: 'Create a new note in a bucket' },
  { id: 'theme-dark', label: '/theme dark', description: 'Switch to dark mode' },
  { id: 'theme-light', label: '/theme light', description: 'Switch to light mode' },
  { id: 'collapse', label: '/collapse', description: 'Toggle sidebar', shortcut: '⌘\\' },
  { id: 'settings', label: '/settings', description: 'Open settings', shortcut: '⌘,' },
  { id: 'help', label: '/help', description: 'Show all keyboard shortcuts', shortcut: '⌘/' },
]

export type CommandListProps = {
  query: string
  highlightedIndex: number
}

function fuzzyMatch(command: string, query: string): boolean {
  const lower = command.toLowerCase()
  const q = query.toLowerCase().replace(/^\//, '')
  if (!q) return true
  let qi = 0
  for (let i = 0; i < lower.length && qi < q.length; i++) {
    if (lower[i] === q[qi]) qi++
  }
  return qi === q.length
}

function highlightChars(text: string, query: string): React.ReactNode {
  const q = query.toLowerCase().replace(/^\//, '')
  if (!q) return text
  const chars = text.split('')
  let qi = 0
  return chars.map((ch, i) => {
    if (qi < q.length && ch.toLowerCase() === q[qi]) {
      qi++
      return <span key={i} className="text-ember-500">{ch}</span>
    }
    return <span key={i}>{ch}</span>
  })
}

export function CommandList({ query, highlightedIndex }: CommandListProps) {
  const navigate = useNavigate()
  const closePalette = useCommandPaletteStore((s) => s.closePalette)
  const toggleCollapse = useSidebarStore((s) => s.toggleCollapse)

  const filtered = COMMANDS.filter((cmd) => fuzzyMatch(cmd.label, query))
  const nonMatching = COMMANDS.filter((cmd) => !fuzzyMatch(cmd.label, query))

  function executeCommand(cmd: PaletteCommand): void {
    closePalette()
    switch (cmd.id) {
      case 'inbox': navigate('/inbox'); break
      case 'graph': navigate('/graph'); break
      case 'review': navigate('/review'); break
      case 'settings': navigate('/settings'); break
      case 'collapse': toggleCollapse(); break
      default: break
    }
  }

  return (
    <div className="max-h-[50vh] overflow-y-auto py-1">
      {filtered.map((cmd, i) => (
        <CommandRow
          key={cmd.id}
          command={cmd}
          query={query}
          highlighted={highlightedIndex === i}
          onClick={() => executeCommand(cmd)}
        />
      ))}
      {nonMatching.map((cmd) => (
        <CommandRow key={cmd.id} command={cmd} query={query} highlighted={false} dimmed onClick={() => {}} />
      ))}
    </div>
  )
}

type CommandRowProps = {
  command: PaletteCommand
  query: string
  highlighted: boolean
  dimmed?: boolean
  onClick: () => void
}

function CommandRow({ command, query, highlighted, dimmed, onClick }: CommandRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full h-11 px-4 transition-colors duration-100 text-left',
        highlighted && 'bg-surface-150',
        dimmed && 'opacity-30',
        !dimmed && !highlighted && 'hover:bg-surface-150',
      )}
    >
      <span className="font-mono-sm text-surface-600 min-w-[120px]">
        {highlightChars(command.label, query)}
      </span>
      <span className="flex-1 font-body-sm text-surface-400">{command.description}</span>
      {command.shortcut && <KeyboardBadge keys={command.shortcut} />}
    </button>
  )
}
