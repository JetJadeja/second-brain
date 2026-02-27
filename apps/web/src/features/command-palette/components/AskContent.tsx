import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { noteRoute } from '@/constants/routes'
import { useCommandPaletteStore } from '@/stores/command-palette.store'
import { useToastStore } from '@/stores/toast.store'
import { commandPaletteService } from '../services/command-palette.service'
import { AskLoadingSteps } from './AskLoadingSteps'
import { AskAnswer } from './AskAnswer'
import type { LoadingStep } from './AskLoadingSteps'
import type { AskResponse, AskCitation, SearchFilters } from '../types/command-palette.types'

export type AskContentProps = {
  query: string
  filters: SearchFilters
  askResponse: AskResponse | null
  isSearching: boolean
}

type ConversationEntry = { question: string; response: AskResponse }

export function AskContent({ query, filters, askResponse, isSearching }: AskContentProps) {
  const navigate = useNavigate()
  const closePalette = useCommandPaletteStore((s) => s.closePalette)
  const toast = useToastStore((s) => s.toast)
  const [conversation, setConversation] = useState<ConversationEntry[]>([])
  const [followUp, setFollowUp] = useState('')
  const [followUpLoading, setFollowUpLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState<LoadingStep>('searching')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isSearching) {
      setLoadingStep('searching')
      const t1 = setTimeout(() => setLoadingStep('found'), 500)
      const t2 = setTimeout(() => setLoadingStep('synthesizing'), 1000)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
    if (askResponse) setLoadingStep('done')
  }, [isSearching, askResponse])

  useEffect(() => {
    if (askResponse && !conversation.some((c) => c.question === query)) {
      setConversation((prev) => [...prev, { question: query, response: askResponse }])
    }
  }, [askResponse, query, conversation])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [conversation])

  const handleFollowUp = useCallback(async () => {
    const q = followUp.trim()
    if (!q || followUpLoading) return
    setFollowUpLoading(true)
    setFollowUp('')
    try {
      const res = await commandPaletteService.askQuestion(q, filters)
      setConversation((prev) => [...prev, { question: q, response: res }])
    } catch {
      toast({ type: 'error', message: 'Follow-up failed. Try again.' })
    } finally {
      setFollowUpLoading(false)
    }
  }, [followUp, followUpLoading, filters])

  function handleCitationClick(citation: AskCitation): void {
    closePalette()
    navigate(noteRoute(citation.note_id))
  }

  const noteCount = askResponse?.source_notes.length ?? 0

  return (
    <div ref={scrollRef} className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
      {isSearching && loadingStep !== 'done' && (
        <AskLoadingSteps step={loadingStep} noteCount={noteCount} />
      )}

      {conversation.map((entry, i) => (
        <AskAnswer
          key={i}
          answer={entry.response.answer}
          onCitationClick={handleCitationClick}
        />
      ))}

      {conversation.length > 0 && conversation.length < 10 && (
        <div className="flex gap-2">
          <input
            type="text"
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleFollowUp() }}
            placeholder="Ask a follow-up…"
            className="flex-1 h-9 px-3 bg-surface-150 border border-surface-200 rounded-lg font-body text-surface-600 placeholder:text-surface-300 outline-none focus:border-ember-500 transition-colors"
          />
        </div>
      )}

      {conversation.length >= 10 && (
        <p className="text-center font-body-sm text-surface-400">
          Start a new question to continue exploring
        </p>
      )}
    </div>
  )
}
