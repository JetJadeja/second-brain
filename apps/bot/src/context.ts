import type { Context } from 'grammy'

export interface BotContext extends Context {
  userId?: string
}
