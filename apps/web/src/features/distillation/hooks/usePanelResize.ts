import { useState, useCallback, useEffect, useRef } from 'react'

const MIN_PANEL_PX = 320
const DEFAULT_LEFT_PERCENT = 50

export function usePanelResize() {
  const [leftPercent, setLeftPercent] = useState(DEFAULT_LEFT_PERCENT)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  useEffect(() => {
    if (!isDragging) return

    function onMouseMove(e: MouseEvent) {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const width = rect.width

      const minPercent = (MIN_PANEL_PX / width) * 100
      const maxPercent = 100 - minPercent
      const rawPercent = (x / width) * 100
      setLeftPercent(Math.min(maxPercent, Math.max(minPercent, rawPercent)))
    }

    function onMouseUp() {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [isDragging])

  return {
    leftPercent,
    isDragging,
    containerRef,
    dividerProps: { onMouseDown: handleMouseDown },
  }
}
