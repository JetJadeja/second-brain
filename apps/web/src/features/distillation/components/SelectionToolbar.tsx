import { useState, useEffect, useCallback, useRef } from 'react'

type SelectionToolbarProps = {
  containerRef: React.RefObject<HTMLDivElement | null>
  onHighlight: (text: string) => void
  onAdd: (text: string) => void
}

type ToolbarPosition = { top: number; left: number }

export function SelectionToolbar({ containerRef, onHighlight, onAdd }: SelectionToolbarProps) {
  const [selectedText, setSelectedText] = useState('')
  const [position, setPosition] = useState<ToolbarPosition | null>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || !selection.rangeCount) {
      setPosition(null)
      setSelectedText('')
      return
    }

    const container = containerRef.current
    if (!container || !container.contains(selection.anchorNode)) {
      setPosition(null)
      setSelectedText('')
      return
    }

    const text = selection.toString().trim()
    if (!text) { setPosition(null); return }

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    setSelectedText(text)
    setPosition({
      top: rect.top - containerRect.top - 44,
      left: rect.left - containerRect.left + rect.width / 2,
    })
  }, [containerRef])

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [handleSelectionChange])

  if (!position || !selectedText) return null

  return (
    <div
      ref={toolbarRef}
      className="absolute z-20 flex -translate-x-1/2 items-center gap-2 rounded-md bg-surface-100 p-2 shadow-lg"
      style={{ top: position.top, left: position.left }}
    >
      <button
        onClick={() => { onHighlight(selectedText); window.getSelection()?.removeAllRanges() }}
        className="whitespace-nowrap text-caption text-surface-400 hover:text-surface-500"
      >
        Highlight
      </button>
      <button
        onClick={() => { onAdd(selectedText); window.getSelection()?.removeAllRanges() }}
        className="whitespace-nowrap text-caption text-ember-500 hover:text-ember-600"
      >
        Add to distillation →
      </button>
    </div>
  )
}
