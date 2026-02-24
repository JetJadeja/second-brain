import type { AnthropicMessageParam } from '@second-brain/ai'
import type { ConversationEntry } from '@second-brain/shared'

/**
 * Builds the message array for Claude from conversation history + current message.
 * Unlike the bot's buildUserMessage, this takes a plain string — no BotContext.
 */
export function buildMessages(
  history: ConversationEntry[],
  message: string,
  attachmentDescription?: string,
): AnthropicMessageParam[] {
  const messages: AnthropicMessageParam[] = []

  for (const entry of history) {
    messages.push({
      role: entry.role === 'user' ? 'user' : 'assistant',
      content: entry.content,
    })
  }

  let userMessage = message
  if (attachmentDescription) {
    userMessage = attachmentDescription + '\n' + userMessage
  }

  messages.push({ role: 'user', content: userMessage })
  return messages
}
