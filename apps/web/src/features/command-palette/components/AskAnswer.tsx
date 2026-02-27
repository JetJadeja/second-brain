import { Zap } from 'lucide-react'
import type { AskAnswer as AskAnswerType, AskCitation } from '../types/command-palette.types'

export type AskAnswerProps = {
  answer: AskAnswerType
  onCitationClick: (citation: AskCitation) => void
}

export function AskAnswer({ answer, onCitationClick }: AskAnswerProps) {
  return (
    <div className="animate-[fade-in_200ms_ease-out]">
      <div className="bg-gradient-to-b from-surface-100 to-surface-150 border-l-[3px] border-l-ember-500 rounded-r-lg p-4">
        <AnswerText text={answer.text} citations={answer.citations} onCitationClick={onCitationClick} />

        {answer.gaps.length > 0 && (
          <div className="mt-4 space-y-2">
            {answer.gaps.map((gap, i) => (
              <div key={i} className="flex items-start gap-2 italic text-surface-400">
                <Zap size={14} className="text-status-raw shrink-0 mt-0.5" />
                <p className="font-body-sm">{gap}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

type AnswerTextProps = {
  text: string
  citations: AskCitation[]
  onCitationClick: (citation: AskCitation) => void
}

function AnswerText({ text, citations, onCitationClick }: AnswerTextProps) {
  const citationMap = new Map(citations.map((c) => [c.index, c]))
  const parts = text.split(/(\[\d+\])/g)

  return (
    <p className="font-body-lg text-surface-600 leading-[1.7]">
      {parts.map((part, i) => {
        const match = /^\[(\d+)\]$/.exec(part)
        if (match) {
          const idx = Number(match[1])
          const citation = citationMap.get(idx)
          if (citation) {
            return (
              <button
                key={i}
                type="button"
                onClick={() => onCitationClick(citation)}
                className="text-ember-500 text-xs align-super hover:underline"
              >
                [{idx}]
              </button>
            )
          }
        }
        return <span key={i}>{part}</span>
      })}
    </p>
  )
}
