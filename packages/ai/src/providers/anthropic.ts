import Anthropic from '@anthropic-ai/sdk'

let client: Anthropic | null = null

function getClient(): Anthropic {
  if (client) return client

  const apiKey = process.env['ANTHROPIC_API_KEY']
  if (!apiKey) {
    throw new Error('Missing ANTHROPIC_API_KEY environment variable')
  }

  client = new Anthropic({ apiKey })
  return client
}

interface CallClaudeParams {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  system?: string
  model?: string
  maxTokens?: number
}

const DEFAULT_MODEL = 'claude-sonnet-4-20250514'

export async function callClaude(params: CallClaudeParams): Promise<string> {
  const { messages, system, model = DEFAULT_MODEL, maxTokens = 1024 } = params
  const anthropic = getClient()

  const request = {
    model,
    max_tokens: maxTokens,
    messages,
    ...(system ? { system } : {}),
  }

  try {
    const response = await anthropic.messages.create(request)
    const block = response.content[0]
    if (!block || block.type !== 'text') {
      throw new Error('Claude returned no text content')
    }
    return block.text
  } catch (error: unknown) {
    if (isRetryable(error)) {
      await sleep(1000)
      const response = await anthropic.messages.create(request)
      const block = response.content[0]
      if (!block || block.type !== 'text') {
        throw new Error('Claude returned no text content after retry')
      }
      return block.text
    }
    throw error
  }
}

function isRetryable(error: unknown): boolean {
  if (error instanceof Anthropic.APIError) {
    return error.status === 429 || error.status === 529
  }
  return false
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
