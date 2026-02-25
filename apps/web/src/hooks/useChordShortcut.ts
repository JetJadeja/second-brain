import { useCallback, useEffect, useRef } from 'react'

const CHORD_TIMEOUT = 500

function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

export function useChordShortcut(
  firstKey: string,
  secondKey: string,
  callback: () => void,
): void {
  const pendingRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stableCallback = useCallback(callback, [callback])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (isInputElement(event.target)) return
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return

      const key = event.key.toLowerCase()

      if (pendingRef.current && key === secondKey.toLowerCase()) {
        event.preventDefault()
        pendingRef.current = false
        if (timerRef.current) clearTimeout(timerRef.current)
        stableCallback()
        return
      }

      if (key === firstKey.toLowerCase()) {
        pendingRef.current = true
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
          pendingRef.current = false
        }, CHORD_TIMEOUT)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [firstKey, secondKey, stableCallback])
}
