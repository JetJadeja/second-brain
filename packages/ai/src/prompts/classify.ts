import type { NoteSource, ParaTreeNode } from '@second-brain/shared'

interface ClassifyPromptParams {
  paraTree: ParaTreeNode[]
  title: string
  content: string
  summary: string | null
  sourceType: NoteSource
  userNote?: string | null
  sampleTitles?: Map<string, string[]>
}

export function buildClassifyPrompt(params: ClassifyPromptParams): string {
  const { paraTree, title, content, summary, sourceType, userNote, sampleTitles } = params

  const treeText = formatTree(paraTree, 0, sampleTitles)
  const truncatedContent = content.length > 4000
    ? content.slice(0, 4000) + '\n...[truncated]'
    : content

  let prompt = `You are classifying a note into a user's PARA organizational system.\n\n`
  prompt += PARA_RULES
  prompt += `\nFOLDER STRUCTURE:\n${treeText}\n`
  prompt += `Items marked [container] are top-level containers. NEVER classify directly into them — always pick a specific subfolder.\n\n`
  prompt += `NOTE TO CLASSIFY:\n`
  prompt += `Title: ${title}\n`
  prompt += `Source type: ${sourceType}\n`

  if (summary) {
    prompt += `Summary: ${summary}\n`
  }

  prompt += `Content:\n${truncatedContent}\n`

  if (userNote) {
    prompt += `\nUSER CONTEXT (THIS TAKES PRIORITY OVER CONTENT ANALYSIS): ${userNote}\n`
    prompt += `The user's stated intent overrides topic analysis. Match to the closest bucket.\n`
  }

  prompt += RESPONSE_FORMAT

  return prompt
}

const PARA_RULES = `PARA CATEGORIES:
- Projects: Active work with a goal or deadline. The user is building/doing something specific.
- Areas: Ongoing responsibilities the user maintains. Things they own, manage, or would feel if neglected (health, finances, their car, their home).
- Resources: Topics of interest. Reference material with no obligation attached. Content they consume or collect (a hobby, a field they read about).
- Archives: Completed or inactive items. Do not classify into archives.

KEY DISTINCTION — Areas vs Resources:
- Does the user OWN, MAINTAIN, or have RESPONSIBILITY for this? → Area
- Is this REFERENCE MATERIAL or content they CONSUME about a topic? → Resource
- Example: A car maintenance receipt → Areas (their car). A YouTube video about car mods → Resources (automotive interest).
- The same topic can appear in both. Use the note's content to determine the user's relationship to it.\n\n`

const RESPONSE_FORMAT = `\nRESPOND with ONLY valid JSON (no markdown, no code fences):
{
  "bucket_id": "<UUID of best matching subfolder, or null>",
  "confidence": <0.0 to 1.0>,
  "is_original_thought": <true if user's own idea/thought, false if external content>,
  "suggest_new_bucket": <OPTIONAL — rarely used, see rules below>
}

CLASSIFICATION PRIORITY (follow this order strictly):
1. ALWAYS prefer an existing bucket, even if the match is imperfect. A note about "success mindset" fits in "Self Improvement" or "Personal Growth" — use the closest match.
2. If NO existing bucket is even a rough match, set bucket_id to null and OMIT suggest_new_bucket. The note goes to inbox for the user to decide. This is the safe default.
3. ONLY as a rare exception: if you are highly confident the topic is completely absent from every existing folder, include suggest_new_bucket: { "name": "<2-4 word folder name, max 25 chars>", "parent_type": "<project|area|resource>" }

A single note is never sufficient evidence that a new bucket is needed. When uncertain, choose option 1 or 2 — never option 3.\n`

function formatTree(
  nodes: ParaTreeNode[],
  depth: number,
  sampleTitles?: Map<string, string[]>,
): string {
  let result = ''
  for (const node of nodes) {
    const indent = '  '.repeat(depth)
    if (depth === 0) {
      result += `${indent}- ${node.name} [container]\n`
    } else {
      result += `${indent}- ${node.name} [${node.type}] (id: ${node.id})`
      if (node.description) {
        result += ` — "${node.description}"`
      }
      result += '\n'

      const titles = sampleTitles?.get(node.id)
      if (titles && titles.length > 0) {
        result += `${indent}  Recent: ${titles.join(', ')}\n`
      }
    }
    if (node.children.length > 0) {
      result += formatTree(node.children, depth + 1, sampleTitles)
    }
  }
  return result
}
