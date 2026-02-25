import { useState } from 'react'

export function AskInput() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState<string | null>(null)

  const handleSubmit = () => {
    if (!query.trim()) return
    setResponse('This feature is coming soon.')
    setQuery('')
  }

  return (
    <div className="space-y-3">
      {response && (
        <div className="rounded-md border-l-2 border-l-ember-500 bg-surface-100 p-3">
          <p className="text-body-sm text-surface-500">{response}</p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
          placeholder="Ask about this note…"
          className="h-8 w-full rounded-md border border-surface-200 bg-surface-150 px-2 text-body-sm text-surface-700 placeholder:text-surface-300 focus:border-ember-500 focus:outline-none"
        />
      </div>
    </div>
  )
}
