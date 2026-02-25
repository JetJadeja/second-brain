const MAX_NOTES_IN_PROMPT = 40

interface NoteSummary {
  title: string
  summary: string | null
}

interface OverviewPrompt {
  system: string
  user: string
}

export function buildOverviewPrompt(
  bucketName: string,
  notes: NoteSummary[],
): OverviewPrompt {
  const trimmed = notes.slice(0, MAX_NOTES_IN_PROMPT)

  const system =
    'You are a knowledge base assistant. ' +
    'Write a concise 2-3 sentence overview of what a collection of notes covers. ' +
    'Write in a natural, flowing style — no bullet points, no lists, no markdown. ' +
    'Focus on the themes, topics, and scope of the collection. ' +
    'Be specific about what the notes actually contain, not generic descriptions. ' +
    'Respond with only the overview text, nothing else.'

  const noteList = trimmed
    .map((n, i) => {
      const line = `${i + 1}. ${n.title}`
      return n.summary ? `${line} — ${n.summary}` : line
    })
    .join('\n')

  const user =
    `Collection: "${bucketName}" (${notes.length} notes)\n\n` +
    `Notes:\n${noteList}`

  return { system, user }
}
