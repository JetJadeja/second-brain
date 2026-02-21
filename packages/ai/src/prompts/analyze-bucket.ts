interface NoteSummary {
  title: string
  summary: string | null
}

interface AnalyzeBucketParams {
  bucketName: string
  bucketType: string
  notes: NoteSummary[]
}

export function buildAnalyzeBucketPrompt(params: AnalyzeBucketParams): string {
  const { bucketName, bucketType, notes } = params

  const noteList = notes
    .map((n, i) => {
      const summary = n.summary ? ` — ${n.summary}` : ''
      return `  ${i}. ${n.title}${summary}`
    })
    .join('\n')

  let prompt = `You are analyzing a user's knowledge base folder to determine if it should be split into sub-folders.\n\n`
  prompt += `FOLDER: "${bucketName}" (type: ${bucketType})\n`
  prompt += `NOTE COUNT: ${notes.length}\n\n`
  prompt += `NOTES IN THIS FOLDER:\n${noteList}\n\n`
  prompt += ANALYSIS_RULES
  prompt += RESPONSE_FORMAT

  return prompt
}

const ANALYSIS_RULES = `ANALYSIS RULES:
- Only suggest splitting if there are clearly distinct sub-topics with multiple notes each.
- Each split must have at least 2 notes. Do not create single-note splits.
- Aim for 2-5 splits maximum. More than 5 means you are over-splitting.
- Split names should be short (1-3 words), descriptive, and natural as folder names.
- Every note must appear in exactly one split. Do not leave notes unassigned.
- If the folder's notes are cohesive and share a single theme, do NOT split.\n\n`

const RESPONSE_FORMAT = `RESPOND with ONLY valid JSON (no markdown, no code fences):
{
  "should_split": true,
  "splits": [
    { "name": "Sub-topic Name", "note_indices": [0, 3, 5, 7] },
    { "name": "Another Topic", "note_indices": [1, 2, 4, 6] }
  ]
}

If the folder is cohesive and should NOT be split:
{
  "should_split": false,
  "splits": []
}\n`
