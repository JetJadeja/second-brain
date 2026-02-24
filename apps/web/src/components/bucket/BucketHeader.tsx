import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import type { BucketDetailResponse } from '../../lib/types'
import { apiPatch } from '../../lib/api-client'
import { Chip } from '../ui/Chip'
import { BucketActions } from './BucketActions'

interface BucketHeaderProps {
  bucket: BucketDetailResponse['bucket']
}

const TYPE_LABELS: Record<string, string> = {
  project: 'Project',
  area: 'Area',
  resource: 'Resource',
  archive: 'Archive',
}

export function BucketHeader({ bucket }: BucketHeaderProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(bucket.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  async function handleRename() {
    const trimmed = name.trim()
    if (!trimmed || trimmed === bucket.name) {
      setName(bucket.name)
      setEditing(false)
      return
    }
    await apiPatch(`/api/para/buckets/${bucket.id}`, { name: trimmed })
    setEditing(false)
    await queryClient.invalidateQueries({ queryKey: ['para-tree'] })
    await queryClient.invalidateQueries({ queryKey: ['bucket', bucket.id] })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {editing ? (
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') { setName(bucket.name); setEditing(false) } }}
            className="text-xl font-semibold text-text-primary bg-transparent border-b border-border focus:border-btn-primary outline-none"
          />
        ) : (
          <h1 className="text-xl font-semibold text-text-primary">{bucket.name}</h1>
        )}
        <span className="text-sm text-text-tertiary">{TYPE_LABELS[bucket.type] ?? bucket.type}</span>
        <div className="ml-auto">
          <BucketActions
            bucketId={bucket.id}
            bucketName={bucket.name}
            noteCount={bucket.note_count}
            onRename={() => setEditing(true)}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-text-tertiary">
        <span>{bucket.note_count} notes</span>
        <span>{bucket.distilled_count} distilled</span>
        <span>{bucket.evergreen_count} evergreen</span>
      </div>

      {bucket.children.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {bucket.children.map((child) => (
            <Chip
              key={child.id}
              label={`${child.name} (${child.note_count})`}
              truncate
              onClick={() => navigate(`/para/${child.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
