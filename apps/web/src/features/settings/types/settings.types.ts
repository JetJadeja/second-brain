export type ShortcutItem = {
  keys: string
  description: string
}

export type ShortcutGroup = {
  label: string
  shortcuts: ShortcutItem[]
}

export const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    label: 'Global',
    shortcuts: [
      { keys: '⌘K', description: 'Open command palette' },
      { keys: '⌘\\', description: 'Toggle sidebar' },
      { keys: '⌘,', description: 'Open settings' },
      { keys: '⌘/', description: 'Show keyboard shortcuts' },
    ],
  },
  {
    label: 'Navigation',
    shortcuts: [
      { keys: 'G then H', description: 'Go to dashboard' },
      { keys: 'G then I', description: 'Go to inbox' },
      { keys: 'G then G', description: 'Go to graph' },
      { keys: 'G then R', description: 'Go to review' },
    ],
  },
  {
    label: 'Inbox',
    shortcuts: [
      { keys: 'J / K', description: 'Move between items' },
      { keys: 'X', description: 'Toggle selection' },
      { keys: '⌘Enter', description: 'Batch classify' },
    ],
  },
  {
    label: 'Note Detail',
    shortcuts: [
      { keys: 'E', description: 'Edit note' },
      { keys: '⌘Enter', description: 'Save changes' },
      { keys: 'D', description: 'Open distillation' },
      { keys: 'Escape', description: 'Close panel' },
    ],
  },
  {
    label: 'Distillation',
    shortcuts: [
      { keys: '⌘Enter', description: 'Save distillation' },
      { keys: '⌘⇧1–4', description: 'AI assist actions' },
      { keys: 'Escape', description: 'Exit distillation' },
    ],
  },
  {
    label: 'Graph',
    shortcuts: [
      { keys: '+ / -', description: 'Zoom in/out' },
      { keys: '0', description: 'Fit to screen' },
      { keys: 'F', description: 'Toggle fullscreen' },
      { keys: '1–4', description: 'PARA type filters' },
      { keys: 'Escape', description: 'Deselect node' },
    ],
  },
]
