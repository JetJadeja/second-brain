import { useEffect } from 'react'

type ShortcutOptions = {
  meta?: boolean
  shift?: boolean
  alt?: boolean
  enableInInputs?: boolean
}

function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: ShortcutOptions = {},
): void {
  const { meta = false, shift = false, alt = false, enableInInputs = false } = options

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (!enableInInputs && isInputElement(event.target)) return

      const metaMatch = meta ? (event.metaKey || event.ctrlKey) : !(event.metaKey || event.ctrlKey)
      const shiftMatch = shift ? event.shiftKey : !event.shiftKey
      const altMatch = alt ? event.altKey : !event.altKey

      if (metaMatch && shiftMatch && altMatch && event.key.toLowerCase() === key.toLowerCase()) {
        event.preventDefault()
        callback()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [key, callback, meta, shift, alt, enableInInputs])
}
