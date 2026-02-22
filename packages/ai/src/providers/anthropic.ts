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

interface CallClaudeVisionParams {
  imageData: string // base64-encoded image
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
  prompt: string
  system?: string
  model?: string
  maxTokens?: number
}

export async function callClaudeVision(params: CallClaudeVisionParams): Promise<string> {
  const { imageData, mediaType, prompt, system, model = DEFAULT_MODEL, maxTokens = 1024 } = params
  const anthropic = getClient()

  const request: Anthropic.MessageCreateParams = {
    model,
    max_tokens: maxTokens,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageData } },
          { type: 'text', text: prompt },
        ],
      },
    ],
    ...(system ? { system } : {}),
  }

  try {
    const response = await anthropic.messages.create(request)
    const block = response.content[0]
    if (!block || block.type !== 'text') {
      throw new Error('Claude Vision returned no text content')
    }
    return block.text
  } catch (error: unknown) {
    if (isRetryable(error)) {
      await sleep(1000)
      const response = await anthropic.messages.create(request)
      const block = response.content[0]
      if (!block || block.type !== 'text') {
        throw new Error('Claude Vision returned no text content after retry')
      }
      return block.text
    }
    throw error
  }
}

export type AnthropicTool = Anthropic.Tool
export type AnthropicMessage = Anthropic.Message
export type AnthropicMessageParam = Anthropic.MessageParam
export type AnthropicContentBlock = Anthropic.ContentBlock
export type AnthropicToolUseBlock = Anthropic.ToolUseBlock
export type AnthropicToolResultBlockParam = Anthropic.ToolResultBlockParam

interface CallClaudeWithToolsParams {
  messages: Anthropic.MessageParam[]
  system: string
  tools: Anthropic.Tool[]
  model?: string
  maxTokens?: number
}

export async function callClaudeWithTools(
  params: CallClaudeWithToolsParams,
): Promise<Anthropic.Message> {
  const { messages, system, tools, model = DEFAULT_MODEL, maxTokens = 4096 } = params
  const anthropic = getClient()

  const request: Anthropic.MessageCreateParams = {
    model,
    max_tokens: maxTokens,
    system,
    messages,
    tools,
  }

  try {
    return await anthropic.messages.create(request)
  } catch (error: unknown) {
    if (isRetryable(error)) {
      await sleep(1000)
      return await anthropic.messages.create(request)
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
