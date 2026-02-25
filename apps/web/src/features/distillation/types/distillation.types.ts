export type Highlight = {
  start: number
  end: number
  reason: string
}

export type DistillAction = 'compress' | 'one_sentence' | 'surprising_claims' | 'connections'

export type DistillTarget = 'key_points' | 'distilled' | 'evergreen'

export type AiAssistResponse = {
  text: string
}

export const DISTILL_ACTION_LABELS: Record<DistillAction, string> = {
  compress: 'Compress further',
  one_sentence: 'One sentence',
  surprising_claims: 'Surprising claims',
  connections: 'How does this connect?',
}
