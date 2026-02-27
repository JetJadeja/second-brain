import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ParaDot } from '@/components/shared/ParaDot'
import { PARA_LABELS } from '@/types/enums'
import type { ParaType } from '@/types/enums'
import type { RootContainer } from '../hooks/useBucketPicker'

const CREATABLE_TYPES: ParaType[] = ['project', 'area', 'resource', 'archive']

type CreateBucketFormProps = {
  rootContainers: RootContainer[]
  onSubmit: (name: string, type: ParaType, parentId: string) => Promise<string>
  onCancel: () => void
}

export function CreateBucketForm({ rootContainers, onSubmit, onCancel }: CreateBucketFormProps) {
  const [name, setName] = useState('')
  const [selectedType, setSelectedType] = useState<ParaType>('project')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parentId = rootContainers.find((r) => r.type === selectedType)?.id

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    if (!name.trim() || !parentId) return

    setIsSubmitting(true)
    setError(null)
    try {
      await onSubmit(name.trim(), selectedType, parentId)
    } catch {
      setError('Failed to create bucket')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-md border border-surface-200 p-3">
      <span className="font-title-sm text-surface-600">New bucket</span>

      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Bucket name"
        maxLength={40}
        autoFocus
      />

      <div className="flex gap-1.5">
        {CREATABLE_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setSelectedType(type)}
            className={`flex items-center gap-1.5 rounded-sm px-2 py-1 text-caption transition-colors ${
              selectedType === type
                ? 'bg-surface-150 text-surface-700'
                : 'text-surface-400 hover:bg-surface-100'
            }`}
          >
            <ParaDot type={type} size={6} />
            {PARA_LABELS[type]}
          </button>
        ))}
      </div>

      {error && <span className="text-caption text-danger">{error}</span>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" disabled={!name.trim() || !parentId || isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create & Select'}
        </Button>
      </div>
    </form>
  )
}
