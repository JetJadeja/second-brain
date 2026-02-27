import { BoundedMap } from '../bounded-map.js'

const TTL_MS = 24 * 60 * 60 * 1000 // 24 hours
const MAX_RECEIPTS = 5000

const receipts = new BoundedMap<string>(TTL_MS, MAX_RECEIPTS)

function makeKey(chatId: number, messageId: number): string {
  return `${chatId}:${messageId}`
}

export function storeReceipt(chatId: number, messageId: number, noteId: string): void {
  receipts.set(makeKey(chatId, messageId), noteId)
}

export function getReceiptNoteId(chatId: number, messageId: number): string | null {
  return receipts.get(makeKey(chatId, messageId)) ?? null
}
