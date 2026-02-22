import type { BotContext } from '../../context.js'
import { executeSaveNote } from './save-note.js'
import { executeSearchNotes } from './search-notes.js'
import { executeShowInbox } from './show-inbox.js'
import { executeCreateBucket } from './create-bucket.js'
import { executeMoveNote } from './move-note.js'
import type { ExtractedContent } from '@second-brain/shared'

interface ToolCallContext {
  userId: string
  ctx: BotContext
  preExtracted?: ExtractedContent
}

export async function executeTool(
  toolName: string,
  input: Record<string, unknown>,
  context: ToolCallContext,
): Promise<string> {
  try {
    const result = await dispatchTool(toolName, input, context)
    return JSON.stringify(result)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[executeTool] ${toolName} failed:`, msg)
    return JSON.stringify({ error: msg })
  }
}

async function dispatchTool(
  toolName: string,
  input: Record<string, unknown>,
  context: ToolCallContext,
): Promise<unknown> {
  switch (toolName) {
    case 'save_note':
      return executeSaveNote({
        userId: context.userId,
        content: String(input['content'] ?? ''),
        sourceType: input['source_type'] as string | undefined,
        preExtracted: context.preExtracted,
      })

    case 'search_notes':
      return executeSearchNotes(context.userId, String(input['query'] ?? ''))

    case 'show_inbox':
      return executeShowInbox(context.userId)

    case 'create_bucket':
      return executeCreateBucket(
        context.userId,
        String(input['name'] ?? ''),
        input['type'] as 'project' | 'area' | 'resource',
        input['parent_name'] as string | undefined,
      )

    case 'move_note':
      return executeMoveNote(
        context.userId,
        String(input['note_id'] ?? ''),
        String(input['target_path'] ?? ''),
      )

    default:
      throw new Error(`Unknown tool: ${toolName}`)
  }
}
