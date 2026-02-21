import type { OnboardingPhase, ConversationEntry } from '@second-brain/shared'

interface OnboardingPromptParams {
  phase: OnboardingPhase
  userMessage: string
  existingBuckets: string[]
  conversationHistory?: ConversationEntry[]
}

export function buildOnboardingPrompt(params: OnboardingPromptParams): string {
  const { phase, userMessage, existingBuckets, conversationHistory } = params

  let prompt = buildSystemContext(phase, existingBuckets)
  prompt += buildConversationSection(conversationHistory)
  prompt += buildPhaseInstructions(phase)
  prompt += buildRules()
  prompt += `\nUSER MESSAGE: "${userMessage}"\n\n`
  prompt += buildResponseFormat()

  return prompt
}

function buildSystemContext(phase: OnboardingPhase, existing: string[]): string {
  let ctx = `You are helping a user set up their personal knowledge management system (Second Brain). `
  ctx += `You are guiding them through onboarding to create their folder structure.\n\n`
  ctx += `CURRENT PHASE: ${phase}\n`

  if (existing.length > 0) {
    ctx += `FOLDERS ALREADY CREATED: ${existing.join(', ')}\n`
  }
  ctx += '\n'
  return ctx
}

function buildConversationSection(history?: ConversationEntry[]): string {
  if (!history || history.length === 0) return ''

  let section = 'CONVERSATION SO FAR:\n'
  for (const entry of history) {
    const prefix = entry.role === 'user' ? 'User' : 'Bot'
    section += `${prefix}: ${entry.content}\n`
  }
  section += '\n'
  return section
}

function buildPhaseInstructions(phase: OnboardingPhase): string {
  switch (phase) {
    case 'projects':
      return buildProjectsPhase()
    case 'areas':
      return buildAreasPhase()
    case 'resources':
      return buildResourcesPhase()
    default:
      return ''
  }
}

function buildProjectsPhase(): string {
  return (
    `PHASE INSTRUCTIONS:\n` +
    `Ask about active projects — things with a goal or deadline.\n` +
    `Extract clean, proper-cased names from the user's response.\n` +
    `Examples: "renovating my kitchen" → "Kitchen Renovation", "building an app called Acme" → "Acme"\n` +
    `All buckets in this phase have type "project" and no parent_name.\n\n`
  )
}

function buildAreasPhase(): string {
  return (
    `PHASE INSTRUCTIONS:\n` +
    `Ask about ongoing areas of responsibility — things they maintain, things they'd feel if neglected.\n` +
    `Examples: "health" → "Health", "my car" → "My Car", "finances" → "Finances"\n` +
    `All buckets in this phase have type "area" and no parent_name.\n\n`
  )
}

function buildResourcesPhase(): string {
  return (
    `PHASE INSTRUCTIONS:\n` +
    `Ask about topics of interest — things they read about, save articles about.\n` +
    `Examples: "cars" → "Cars", "coffee" → "Coffee", "artificial intelligence" → "AI"\n` +
    `All buckets in this phase have type "resource" and no parent_name.\n` +
    `For broad topics, consider probing for subfolders (e.g., "Cars" → Maintenance, Mods).\n\n`
  )
}

function buildRules(): string {
  let rules = `RULES:\n`
  rules += `- Parse the user's response and extract bucket names. Clean them up (proper case, concise).\n`
  rules += `- If the user says "none", "nothing", "skip", "idk", "no", or similar → use action "skip_phase".\n`
  rules += `- If the user says "skip all", "no thanks", "I'll do it later" → use action "finish".\n`
  rules += `- If you created broad top-level buckets and want to suggest subfolders → use action "probe".\n`
  rules += `- Only probe ONCE per phase. Don't keep asking follow-ups.\n`
  rules += `- Keep your message natural, friendly, and concise.\n`
  rules += `- When creating buckets, set next_phase to the phase AFTER the current one.\n`
  rules += `- Phase order: projects → areas → resources → done.\n`
  rules += `- If this is the resources phase (last one), next_phase should be "done" after creating buckets.\n\n`
  return rules
}

function buildResponseFormat(): string {
  let format = `Respond with ONLY valid JSON (no markdown, no code fences):\n`
  format += `{\n`
  format += `  "action": "create_buckets | probe | skip_phase | finish",\n`
  format += `  "buckets": [{ "name": "Bucket Name", "type": "project|area|resource", "parent_name": null or "Parent Name" }],\n`
  format += `  "message": "Your natural language response to the user",\n`
  format += `  "next_phase": "areas | resources | done | null"\n`
  format += `}`
  return format
}
