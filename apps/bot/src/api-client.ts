import type { ChatRequest, ChatResponse } from '@second-brain/shared'

const API_URL = process.env['API_URL'] || 'http://localhost:3001'
const INTERNAL_API_KEY = process.env['INTERNAL_API_KEY']

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  if (!INTERNAL_API_KEY) {
    throw new Error('INTERNAL_API_KEY not configured')
  }

  const res = await fetch(`${API_URL}/api/internal/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Key': INTERNAL_API_KEY,
    },
    body: JSON.stringify(request),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error(`[api-client] ${res.status}: ${body}`)
    throw new Error(`API returned ${res.status}`)
  }

  return await res.json() as ChatResponse
}
