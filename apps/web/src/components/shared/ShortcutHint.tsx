import { useState, useEffect } from 'react'

const STORAGE_KEY = 'shortcutHintsShown'

function getShownHints(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
  } catch {
    return new Set()
  }
}

function markShown(key: string): void {
  const hints = getShownHints()
  hints.add(key)
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...hints]))
}

type ShortcutHintProps = {
  shortcutKey: string
  label: string
}

export function ShortcutHint({ shortcutKey, label }: ShortcutHintProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!getShownHints().has(shortcutKey)) {
      setVisible(true)
      markShown(shortcutKey)
      const timer = setTimeout(() => setVisible(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [shortcutKey])

  if (!visible) return null

  return (
    <span className="ml-2 text-[10px] text-[var(--surface-300)] transition-opacity duration-200">
      Tip: Use {label} next time
    </span>
  )
}
