export type ConversationRole = 'user' | 'assistant'

export interface ConversationEntry {
  role: ConversationRole
  content: string
  noteIds: string[]
  timestamp: number
}
