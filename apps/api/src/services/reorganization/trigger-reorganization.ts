import { incrementTotalNotes, upsertAnalysisState } from '@second-brain/db'
import { runReorganization } from './run-reorganization.js'

const FIRST_ANALYSIS_THRESHOLD = 30
const SUBSEQUENT_INTERVAL = 50

export async function maybeTriggerReorganization(userId: string): Promise<void> {
  try {
    const state = await incrementTotalNotes(userId)

    const isFirstRun = state.notes_at_last_analysis === 0
      && state.total_notes >= FIRST_ANALYSIS_THRESHOLD

    const isSubsequent = state.notes_at_last_analysis > 0
      && state.total_notes - state.notes_at_last_analysis >= SUBSEQUENT_INTERVAL

    if (!isFirstRun && !isSubsequent) return

    // Fire-and-forget — run analysis and update state
    runReorganization(userId)
      .then(async () => {
        await upsertAnalysisState(userId, {
          notes_at_last_analysis: state.total_notes,
          last_analysis_at: new Date().toISOString(),
        })
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        console.error('[trigger-reorg] analysis failed:', msg)
      })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[trigger-reorg] increment failed:', msg)
  }
}
