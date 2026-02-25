import { useState, useEffect, useCallback, useRef } from 'react'

const PHRASES: [string, ...string[]] = [
  'Remember everything.',
  'Retrieve anything.',
  'Your external mind.',
  'Knowledge, compounded.',
]

type Phase = 'typing' | 'holding' | 'fading' | 'pausing'

export function TypingAnimation() {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [phase, setPhase] = useState<Phase>('typing')
  const [cursorVisible, setCursorVisible] = useState(true)
  const prefersReducedMotion = useRef(false)

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const currentPhrase = PHRASES[phraseIndex] ?? PHRASES[0] as string

  const advancePhrase = useCallback(() => {
    setPhraseIndex((i) => (i + 1) % PHRASES.length)
    setDisplayedText('')
    setPhase('typing')
  }, [])

  // Cursor blink
  useEffect(() => {
    if (phase === 'fading' || phase === 'pausing') return
    const interval = setInterval(() => setCursorVisible((v) => !v), 500)
    return () => clearInterval(interval)
  }, [phase])

  // Typing phase
  useEffect(() => {
    if (phase !== 'typing') return
    if (prefersReducedMotion.current) {
      setDisplayedText(currentPhrase)
      setPhase('holding')
      return
    }
    if (displayedText.length >= currentPhrase.length) {
      setPhase('holding')
      return
    }
    const delay = 80 + Math.random() * 60
    const timer = setTimeout(() => {
      setDisplayedText(currentPhrase.slice(0, displayedText.length + 1))
    }, delay)
    return () => clearTimeout(timer)
  }, [phase, displayedText, currentPhrase])

  // Holding phase
  useEffect(() => {
    if (phase !== 'holding') return
    const timer = setTimeout(() => setPhase('fading'), 2500)
    return () => clearTimeout(timer)
  }, [phase])

  // Fading phase
  useEffect(() => {
    if (phase !== 'fading') return
    const timer = setTimeout(() => setPhase('pausing'), 300)
    return () => clearTimeout(timer)
  }, [phase])

  // Pause then next phrase
  useEffect(() => {
    if (phase !== 'pausing') return
    const timer = setTimeout(advancePhrase, 200)
    return () => clearTimeout(timer)
  }, [phase, advancePhrase])

  return (
    <span
      className="font-title-lg text-surface-500 inline-flex items-center transition-opacity duration-300"
      style={{ opacity: phase === 'fading' ? 0 : 1 }}
    >
      <span>{displayedText}</span>
      <span
        className="inline-block w-[2px] h-[1.2em] bg-surface-500 ml-0.5"
        style={{ opacity: cursorVisible && phase !== 'fading' && phase !== 'pausing' ? 1 : 0 }}
      />
    </span>
  )
}
