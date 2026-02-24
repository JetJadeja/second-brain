import { executeSaveNote } from './save-note.js'
import { executeSearchNotes } from './search-notes.js'
import { executeShowInbox } from './show-inbox.js'
import { executeCreateBucket } from './create-bucket.js'
import { executeMoveNote } from './move-note.js'
import { executeFinalizeOnboarding } from './finalize-onboarding.js'
import type { ExtractedContent } from '@second-brain/shared'

export interface ToolCallContext {
  userId: string
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
        input['description'] as string | undefined,
      )

    case 'move_note':
      return executeMoveNote(
        context.userId,
        String(input['note_id'] ?? ''),
        String(input['target_path'] ?? ''),
      )

    case 'finalize_onboarding':
      return executeFinalizeOnboarding(
        context.userId,
        parseBucketSpecs(input['buckets']),
      )

    default:
      throw new Error(`Unknown tool: ${toolName}`)
  }
}

function parseBucketSpecs(
  value: unknown,
): { name: string; type: 'project' | 'area' | 'resource'; parentName: string | null; description?: string }[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((b): b is Record<string, unknown> => typeof b === 'object' && b !== null)
    .map((b) => ({
      name: String(b['name'] ?? ''),
      type: parseBucketType(b['type']),
      parentName: b['parent_name'] ? String(b['parent_name']) : null,
      ...(b['description'] ? { description: String(b['description']) } : {}),
    }))
    .filter((b) => b.name.length > 0)
}

function parseBucketType(value: unknown): 'project' | 'area' | 'resource' {
  const str = String(value ?? '').toLowerCase()
  if (str === 'project' || str === 'area' || str === 'resource') return str
  return 'resource'
}
