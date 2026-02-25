import { useRef, useEffect } from 'react'

type BulletEditorProps = {
  bullets: string[]
  onUpdate: (index: number, text: string) => void
  onAdd: (text: string, index?: number) => void
  onRemove: (index: number) => void
}

export function BulletEditor({ bullets, onUpdate, onAdd, onRemove }: BulletEditorProps) {
  if (bullets.length === 0) {
    return (
      <div className="py-8 text-center text-body text-surface-300">
        Start distilling your key insights…
      </div>
    )
  }

  return (
    <ul className="space-y-1">
      {bullets.map((text, i) => (
        <BulletRow
          key={i}
          text={text}
          index={i}
          onUpdate={onUpdate}
          onAdd={onAdd}
          onRemove={onRemove}
        />
      ))}
    </ul>
  )
}

type BulletRowProps = {
  text: string
  index: number
  onUpdate: (index: number, text: string) => void
  onAdd: (text: string, index?: number) => void
  onRemove: (index: number) => void
}

function BulletRow({ text, index, onUpdate, onAdd, onRemove }: BulletRowProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (text === '' && inputRef.current) inputRef.current.focus()
  }, [text])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      onAdd('', index + 1)
    }
    if (e.key === 'Backspace' && text === '') {
      e.preventDefault()
      onRemove(index)
    }
  }

  return (
    <li className="group flex items-start gap-2">
      <span className="mt-[3px] flex h-5 w-3 flex-col items-center justify-center gap-[2px] opacity-0 transition-opacity group-hover:opacity-100">
        <span className="h-[3px] w-[3px] rounded-full bg-surface-300" />
        <span className="h-[3px] w-[3px] rounded-full bg-surface-300" />
        <span className="h-[3px] w-[3px] rounded-full bg-surface-300" />
      </span>
      <span className="mt-[2px] text-body text-surface-600">•</span>
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => onUpdate(index, e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent text-body text-surface-600 outline-none placeholder:text-surface-300"
        placeholder="Type a key point…"
      />
    </li>
  )
}
