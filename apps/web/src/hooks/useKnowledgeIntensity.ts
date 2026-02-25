import { useEffect } from 'react'

const MAX_NOTES = 3000

export function useKnowledgeIntensity(noteCount: number): void {
  useEffect(() => {
    const intensity = Math.min(1, noteCount / MAX_NOTES)
    document.documentElement.style.setProperty('--knowledge-intensity', String(intensity))
    return () => {
      document.documentElement.style.removeProperty('--knowledge-intensity')
    }
  }, [noteCount])
}
