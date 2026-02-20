const TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

interface ReceiptEntry {
  noteId: string
  storedAt: number
}

const receipts = new Map<string, ReceiptEntry>()

function makeKey(chatId: number, messageId: number): string {
  return `${chatId}:${messageId}`
}

export function storeReceipt(chatId: number, messageId: number, noteId: string): void {
  const key = makeKey(chatId, messageId)
  receipts.set(key, { noteId, storedAt: Date.now() })

  // Lazy cleanup — remove expired entries
  for (const [k, v] of receipts) {
    if (Date.now() - v.storedAt > TTL_MS) {
      receipts.delete(k)
    }
  }
}

export function getReceiptNoteId(chatId: number, messageId: number): string | null {
  const key = makeKey(chatId, messageId)
  const entry = receipts.get(key)

  if (!entry) return null
  if (Date.now() - entry.storedAt > TTL_MS) {
    receipts.delete(key)
    return null
  }

  return entry.noteId
}
