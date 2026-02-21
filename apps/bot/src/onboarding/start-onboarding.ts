import { upsertOnboardingState } from '@second-brain/db'
import type { BotContext } from '../context.js'
import { recordBotResponse } from '../conversation/record-exchange.js'
import { setOnboardingPhase } from './onboarding-store.js'
import { ensureRootBuckets } from './ensure-root-buckets.js'

const WELCOME_MESSAGE =
  "Welcome to your Second Brain! Let me help you set up your organization. " +
  "I'll ask you a few questions to build your folder structure — " +
  'this takes about 2 minutes and makes everything work way better from day one.'

const FIRST_QUESTION =
  'First — what projects are you actively working on? Think things with a goal or a deadline. ' +
  "(e.g., 'renovating my kitchen, building an app called Acme, planning a trip to Japan')\n\n" +
  'Say "skip" if you don\'t have any active projects right now.'

/**
 * Starts the onboarding flow for a newly linked user.
 * Ensures root PARA buckets exist, sets onboarding state,
 * and sends the welcome + first question.
 */
export async function startOnboarding(ctx: BotContext): Promise<void> {
  const userId = ctx.userId
  if (!userId) return

  // Ensure root PARA containers exist
  await ensureRootBuckets(userId)

  // Set onboarding state
  setOnboardingPhase(userId, 'projects')
  upsertOnboardingState(userId, 'projects').catch(() => {})

  // Send welcome and first question
  await ctx.reply(WELCOME_MESSAGE)
  await ctx.reply(FIRST_QUESTION)

  const summary = `${WELCOME_MESSAGE}\n\n${FIRST_QUESTION}`
  recordBotResponse(userId, summary)
}
