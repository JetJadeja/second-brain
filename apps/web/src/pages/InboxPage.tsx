import { useInbox } from '@/features/inbox/hooks/useInbox'
import { useInboxKeyboard } from '@/features/inbox/hooks/useInboxKeyboard'
import { InboxHeader } from '@/features/inbox/components/InboxHeader'
import { SmartBatchBanner } from '@/features/inbox/components/SmartBatchBanner'
import { InboxColumnHeaders } from '@/features/inbox/components/InboxColumnHeaders'
import { InboxNoteRow } from '@/features/inbox/components/InboxNoteRow'
import { InboxSuggestionRow } from '@/features/inbox/components/InboxSuggestionRow'
import { BatchToolbar } from '@/features/inbox/components/BatchToolbar'
import { InboxEmptyState } from '@/features/inbox/components/InboxEmptyState'
import { InboxSkeleton } from '@/features/inbox/components/InboxSkeleton'

export function InboxPage() {
  const inbox = useInbox()

  useInboxKeyboard({
    items: inbox.items,
    focusedIndex: inbox.focusedIndex,
    setFocusedIndex: inbox.setFocusedIndex,
    expandedId: inbox.expandedId,
    selectedIds: inbox.selectedIds,
    toggleSelect: inbox.toggleSelect,
    toggleExpand: inbox.toggleExpand,
    clearSelection: inbox.clearSelection,
    classifyNote: inbox.classifyNote,
    archiveNote: inbox.archiveNote,
    deleteNote: inbox.deleteNote,
  })

  const handleBatchConfirm = () => {
    if (!inbox.cluster) return
    const classifications = inbox.cluster.noteIds.map((id) => ({
      note_id: id,
      bucket_id: inbox.cluster!.bucketId,
    }))
    void inbox.batchClassify(classifications)
  }

  const allSelected = inbox.noteItems.length > 0 && inbox.selectedIds.size === inbox.noteItems.length
  const someSelected = inbox.selectedIds.size > 0
  const hasAllSuggestions = inbox.noteItems
    .filter((n) => inbox.selectedIds.has(n.id))
    .some((n) => !n.ai_suggested_bucket)

  const handleConfirmSuggested = () => {
    const classifications = inbox.noteItems
      .filter((n) => inbox.selectedIds.has(n.id) && n.ai_suggested_bucket)
      .map((n) => ({ note_id: n.id, bucket_id: n.ai_suggested_bucket! }))
    if (classifications.length > 0) void inbox.batchClassify(classifications)
  }

  const handleBatchArchive = () => {
    for (const id of inbox.selectedIds) void inbox.archiveNote(id)
  }

  const handleBatchDelete = () => {
    for (const id of inbox.selectedIds) void inbox.deleteNote(id)
  }

  if (inbox.isLoading) {
    return (
      <div className="px-6 pt-6">
        <InboxHeader totalCount={0} />
        <div className="mt-4"><InboxSkeleton /></div>
      </div>
    )
  }

  if (inbox.items.length === 0) {
    return (
      <div className="flex h-full flex-col px-6 pt-6">
        <InboxHeader totalCount={0} />
        <InboxEmptyState />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col px-6 pt-6">
      <InboxHeader totalCount={inbox.totalCount} />

      <div className="mt-4 space-y-3">
        <SmartBatchBanner
          cluster={inbox.cluster}
          onConfirm={handleBatchConfirm}
          onDismiss={() => {/* dismiss cluster for session */}}
        />
      </div>

      <div className="mt-2 flex flex-1 flex-col overflow-y-auto">
        <InboxColumnHeaders
          allSelected={allSelected}
          someSelected={someSelected}
          onToggleAll={inbox.toggleAll}
        />

        {inbox.items.map((item, index) =>
          item.item_type === 'note' ? (
            <InboxNoteRow
              key={item.id}
              item={item}
              selected={inbox.selectedIds.has(item.id)}
              focused={index === inbox.focusedIndex}
              expanded={inbox.expandedId === item.id}
              onToggleSelect={() => inbox.toggleSelect(item.id)}
              onToggleExpand={() => inbox.toggleExpand(item.id)}
              onClassify={() => {
                if (item.ai_suggested_bucket) inbox.classifyNote(item.id, item.ai_suggested_bucket)
              }}
              onSkip={() => inbox.archiveNote(item.id)}
            />
          ) : (
            <InboxSuggestionRow
              key={item.id}
              item={item}
              onAccept={() => inbox.acceptSuggestion(item.id)}
              onDismiss={() => inbox.dismissSuggestion(item.id)}
            />
          ),
        )}
      </div>

      <BatchToolbar
        selectedCount={inbox.selectedIds.size}
        hasAllSuggestions={hasAllSuggestions}
        onConfirmSuggested={handleConfirmSuggested}
        onArchive={handleBatchArchive}
        onDelete={handleBatchDelete}
      />
    </div>
  )
}
