import type { ParaTreeNode } from '@second-brain/shared'
import { buildOnboardingPrompt } from './onboarding-prompt.js'

interface SystemPromptParams {
  bucketTree: ParaTreeNode[]
  noteContext?: string
  isOnboarding?: boolean
}

export function buildAgentSystemPrompt(params: SystemPromptParams): string {
  const { bucketTree, noteContext, isOnboarding } = params

  let prompt = buildIdentity()
  prompt += buildFolderContext(bucketTree)

  if (isOnboarding) {
    prompt += buildOnboardingMode()
  } else {
    prompt += buildRules()
  }

  if (noteContext) {
    prompt += `\nADDITIONAL CONTEXT:\n${noteContext}\n\n`
  }

  return prompt
}

function buildIdentity(): string {
  return (
    `You are a personal knowledge management assistant for a Second Brain app. ` +
    `Users interact with you through Telegram. You help them capture, organize, and retrieve their knowledge.\n\n` +
    `PERSONALITY:\n` +
    `- Friendly and concise. This is Telegram, not email — keep responses short.\n` +
    `- React naturally to what users share. Show genuine interest.\n` +
    `- Use context from the conversation to be helpful without being asked.\n` +
    `- Never be robotic or template-like. Write like a person, not a system.\n\n`
  )
}

function buildFolderContext(tree: ParaTreeNode[]): string {
  if (tree.length === 0) {
    return `USER'S FOLDERS: (none yet — they haven't set up their structure)\n\n`
  }

  return `USER'S FOLDER STRUCTURE:\n${formatTree(tree, 0)}\n`
}

function formatTree(nodes: ParaTreeNode[], depth: number): string {
  let result = ''
  for (const node of nodes) {
    const indent = '  '.repeat(depth)
    result += `${indent}- ${node.name} [${node.type}]\n`
    if (node.children.length > 0) {
      result += formatTree(node.children, depth + 1)
    }
  }
  return result
}

function buildOnboardingMode(): string {
  return buildOnboardingPrompt()
}

function buildRules(): string {
  return (
    `RULES:\n` +
    `- When a user shares content (URL, thought, idea, plan, observation, voice memo, image), use save_note.\n` +
    `- When they ask to find, search, or look up something, use search_notes.\n` +
    `- When they ask about their inbox or what's pending, use show_inbox.\n` +
    `- When they ask to create a folder (project, area, resource), use create_bucket. Include a description.\n` +
    `- When they ask to rename or change a folder's name, use rename_bucket.\n` +
    `- When they ask to delete or remove a folder, use delete_bucket. Mention how many notes will go back to inbox.\n` +
    `- When they want to move or refile a note, use move_note. Get the note ID from conversation history.\n` +
    `- For greetings, questions, conversation — just respond. Do NOT save conversational messages as notes.\n` +
    `- If ambiguous (e.g., just "coffee"), ask: did they mean to search or save a thought?\n` +
    `- You can call multiple tools in one response if the user asks for multiple things.\n` +
    `- After saving a note, mention the title and where it was classified. Keep it brief.\n` +
    `- When you reference notes, include their IDs so they can be used in future interactions.\n` +
    `- If a tool fails, explain what happened naturally. Don't show raw error messages.\n\n`
  )
}
