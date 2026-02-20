import type { ParaTreeNode } from '@second-brain/shared'

interface ExtractContextPromptParams {
  rawText: string
  paraTree: ParaTreeNode[]
}

export function buildExtractContextPrompt(params: ExtractContextPromptParams): string {
  const { rawText, paraTree } = params

  const bucketNames = collectBucketNames(paraTree)
  const bucketList = bucketNames.length > 0
    ? bucketNames.join(', ')
    : '(no buckets yet)'

  let prompt = `Analyze this Telegram message and separate the URL (if any) from the user's context text.\n\n`
  prompt += `Message: "${rawText}"\n\n`
  prompt += `User's existing buckets/topics: ${bucketList}\n\n`
  prompt += `Respond with ONLY valid JSON (no markdown, no code fences):\n`
  prompt += `{\n`
  prompt += `  "url": "<extracted URL or null if none>",\n`
  prompt += `  "user_note": "<the user's context text excluding the URL, or null if just a bare URL>",\n`
  prompt += `  "mentioned_bucket": "<name of a bucket the user seems to reference, or null>"\n`
  prompt += `}`

  return prompt
}

function collectBucketNames(nodes: ParaTreeNode[]): string[] {
  const names: string[] = []
  for (const node of nodes) {
    names.push(node.name)
    if (node.children.length > 0) {
      names.push(...collectBucketNames(node.children))
    }
  }
  return names
}
