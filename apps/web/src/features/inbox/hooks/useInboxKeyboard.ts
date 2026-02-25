import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import type { InboxItem, InboxNoteItem } from '../types/inbox.types'

type UseInboxKeyboardOptions = {
  items: InboxItem[]
  focusedIndex: number
  setFocusedIndex: (index: number) => void
  expandedId: string | null
  selectedIds: Set<string>
  toggleSelect: (id: string) => void
  toggleExpand: (id: string) => void
  clearSelection: () => void
  classifyNote: (noteId: string, bucketId: string) => void
  archiveNote: (noteId: string) => void
  deleteNote: (noteId: string) => void
}

function getNoteItems(items: InboxItem[]): InboxNoteItem[] {
  return items.filter((i): i is InboxNoteItem => i.item_type === 'note')
}

export function useInboxKeyboard(options: UseInboxKeyboardOptions): void {
  const {
    items, focusedIndex, setFocusedIndex, expandedId, selectedIds,
    toggleSelect, toggleExpand, clearSelection, classifyNote, archiveNote, deleteNote,
  } = options

  const noteItems = getNoteItems(items)

  // J — next row
  useKeyboardShortcut('j', () => {
    if (focusedIndex < noteItems.length - 1) setFocusedIndex(focusedIndex + 1)
  })

  // K — previous row
  useKeyboardShortcut('k', () => {
    if (focusedIndex > 0) setFocusedIndex(focusedIndex - 1)
  })

  // X — toggle selection
  useKeyboardShortcut('x', () => {
    const note = noteItems[focusedIndex]
    if (note) toggleSelect(note.id)
  })

  // Enter — toggle expand
  useKeyboardShortcut('Enter', () => {
    const note = noteItems[focusedIndex]
    if (note) toggleExpand(note.id)
  })

  // ⌘Enter — confirm classification
  useKeyboardShortcut('Enter', () => {
    const note = noteItems[focusedIndex]
    if (note?.ai_suggested_bucket) classifyNote(note.id, note.ai_suggested_bucket)
  }, { meta: true })

  // A — archive
  useKeyboardShortcut('a', () => {
    const note = noteItems[focusedIndex]
    if (note) archiveNote(note.id)
  })

  // # — delete
  useKeyboardShortcut('#', () => {
    const note = noteItems[focusedIndex]
    if (note) deleteNote(note.id)
  }, { shift: true })

  // Escape — collapse or deselect
  useKeyboardShortcut('Escape', () => {
    if (expandedId) {
      toggleExpand(expandedId)
    } else if (selectedIds.size > 0) {
      clearSelection()
    }
  })
}
