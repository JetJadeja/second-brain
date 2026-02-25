import { countInboxNotes, getInboxNotes } from '@second-brain/db'

export interface InboxItem {
  title: string
  sourceType: string
  date: string
}

export interface ShowInboxResult {
  count: number
  recentItems: InboxItem[]
}

export async function executeShowInbox(userId: string): Promise<ShowInboxResult> {
  const [count, { data: recent }] = await Promise.all([
    countInboxNotes(userId),
    getInboxNotes(userId, { limit: 5 }),
  ])

  const recentItems: InboxItem[] = recent.map((note) => ({
    title: note.title,
    sourceType: note.source_type,
    date: new Date(note.captured_at).toLocaleDateString(),
  }))

  return { count, recentItems }
}
