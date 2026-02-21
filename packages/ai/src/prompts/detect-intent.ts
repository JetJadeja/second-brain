import type { ParaTreeNode } from '@second-brain/shared'

interface DetectIntentPromptParams {
  messageText: string
  paraTree: ParaTreeNode[]
  hasAttachment: boolean
  hasUrl: boolean
}

export function buildDetectIntentPrompt(params: DetectIntentPromptParams): string {
  const { messageText, paraTree, hasUrl } = params
  const treeText = formatBucketNames(paraTree)

  let prompt = `You are an intent classifier for a personal knowledge management bot. `
  prompt += `Determine what the user wants to do based on their message.\n\n`

  prompt += `POSSIBLE INTENTS:\n`
  prompt += `- save_content: The user is sharing content to save (a thought, idea, note, reflection, observation, plan, or reminder). This is the DEFAULT.\n`
  prompt += `- search: The user wants to search or query their knowledge base.\n`
  prompt += `- create_bucket: The user wants to create a new project, area, or resource folder.\n`
  prompt += `- show_inbox: The user wants to check their inbox status.\n`
  prompt += `- move_note: The user wants to move a note to a different folder.\n\n`

  prompt += `USER'S EXISTING FOLDERS:\n${treeText}\n\n`

  prompt += buildExamples()

  prompt += `CRITICAL RULES:\n`
  prompt += `- When in doubt, return "save_content". Content capture is the safe default.\n`
  prompt += `- Personal thoughts, reflections, ideas, plans, and observations are ALWAYS save_content.\n`
  prompt += `- Only return create_bucket when the user EXPLICITLY asks to create/add/start a new project, area, or resource.\n`
  prompt += `- "I want to cook pasta" = save_content (personal thought). "Create a cooking project" = create_bucket (explicit instruction).\n`

  if (hasUrl) {
    prompt += `- This message contains a URL. Messages with URLs are almost always save_content unless the surrounding text is clearly an instruction.\n`
  }

  prompt += `\nMESSAGE: "${messageText}"\n\n`

  prompt += `Respond with ONLY valid JSON (no markdown, no code fences):\n`
  prompt += buildResponseFormat()

  return prompt
}

function buildExamples(): string {
  let examples = `EXAMPLES:\n`
  examples += `- "I had a great idea about solar panels" → save_content\n`
  examples += `- "Remember to buy milk" → save_content\n`
  examples += `- "What do I know about espresso?" → search (query: "espresso")\n`
  examples += `- "Find my notes about AI" → search (query: "AI")\n`
  examples += `- "How's my inbox?" → show_inbox\n`
  examples += `- "What's in my inbox?" → show_inbox\n`
  examples += `- "Create a project called Kitchen Reno" → create_bucket (name: "Kitchen Reno", type: "project")\n`
  examples += `- "I'm starting a new area for fitness" → create_bucket (name: "Fitness", type: "area")\n`
  examples += `- "Add a resource folder for Coffee" → create_bucket (name: "Coffee", type: "resource")\n`
  examples += `- "Create Maintenance under Cars" → create_bucket (name: "Maintenance", parent: "Cars")\n`
  examples += `- "Move this to Resources > Cars" → move_note (target: "Resources > Cars")\n`
  examples += `- "Put this in my Coffee folder" → move_note (target: "Coffee")\n\n`
  return examples
}

function buildResponseFormat(): string {
  let format = `{\n`
  format += `  "intent": "save_content|search|create_bucket|show_inbox|move_note",\n`
  format += `  "confidence": 0.0-1.0,\n`
  format += `  "query": "search query text (only for search intent)",\n`
  format += `  "bucket_name": "name of bucket to create (only for create_bucket)",\n`
  format += `  "bucket_type": "project|area|resource (only for create_bucket)",\n`
  format += `  "parent_name": "parent folder name or null (only for create_bucket)",\n`
  format += `  "target_path": "target folder path (only for move_note)"\n`
  format += `}`
  return format
}

function formatBucketNames(nodes: ParaTreeNode[], depth: number = 0): string {
  let result = ''
  for (const node of nodes) {
    const indent = '  '.repeat(depth)
    result += `${indent}- ${node.name} [${node.type}]\n`
    if (node.children.length > 0) {
      result += formatBucketNames(node.children, depth + 1)
    }
  }
  return result || '(no folders yet)\n'
}
