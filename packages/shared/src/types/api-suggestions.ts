export interface SuggestionsResponse {
  suggestions: Array<{
    id: string
    type: string
    payload: Record<string, unknown>
    created_at: string
  }>
}
