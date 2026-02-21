import { buildOnboardingPrompt, callClaude } from '@second-brain/ai'
import { getAllBuckets } from '@second-brain/db'
import { upsertOnboardingState } from '@second-brain/db'
import type { OnboardingPhase } from '@second-brain/shared'
import type { BotContext } from '../context.js'
import { loadHistory } from '../conversation/load-history.js'
import { recordUserMessage, recordBotResponse } from '../conversation/record-exchange.js'
import { getOnboardingPhase, setOnboardingPhase } from './onboarding-store.js'
import { parseOnboardingResponse } from './parse-onboarding-response.js'
import { createOnboardingBuckets } from './create-onboarding-buckets.js'
import { completeOnboarding } from './complete-onboarding.js'

export async function handleOnboarding(ctx: BotContext): Promise<void> {
  const userId = ctx.userId
  if (!userId) return

  const text = ctx.message?.text ?? ''
  if (!text.trim()) return

  const phase = getOnboardingPhase(userId)
  if (!phase) return

  await ctx.replyWithChatAction('typing')
  recordUserMessage(userId, text)

  const action = await getOnboardingAction(userId, phase, text)

  // Create any buckets the LLM suggested
  if (action.buckets.length > 0) {
    await createOnboardingBuckets(userId, action.buckets)
  }

  // Handle phase transitions
  if (action.action === 'finish') {
    await completeOnboarding(ctx, userId)
    return
  }

  const nextPhase = action.nextPhase ?? phase
  if (nextPhase === 'done') {
    await completeOnboarding(ctx, userId)
    return
  }

  // Update phase if it changed
  if (nextPhase !== phase) {
    setOnboardingPhase(userId, nextPhase)
    upsertOnboardingState(userId, nextPhase).catch(() => {})
  }

  await ctx.reply(action.message)
  recordBotResponse(userId, action.message)
}

async function getOnboardingAction(
  userId: string,
  phase: OnboardingPhase,
  userMessage: string,
) {
  try {
    const [history, buckets] = await Promise.all([
      loadHistory(userId),
      getAllBuckets(userId),
    ])

    const existingNames = buckets
      .filter((b) => b.parent_id !== null)
      .map((b) => b.name)

    const prompt = buildOnboardingPrompt({
      phase,
      userMessage,
      existingBuckets: existingNames,
      conversationHistory: history,
    })

    const response = await callClaude({
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 512,
    })

    return parseOnboardingResponse(response)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[handleOnboarding] LLM call failed:', msg)
    return {
      action: 'skip_phase' as const,
      buckets: [],
      message: "Something went wrong. Let's move on to the next step.",
      nextPhase: getNextPhase(phase),
    }
  }
}

function getNextPhase(current: OnboardingPhase): OnboardingPhase {
  switch (current) {
    case 'projects': return 'areas'
    case 'areas': return 'resources'
    case 'resources': return 'done'
    default: return 'done'
  }
}
