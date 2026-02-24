import { checkBloatedBuckets } from './check-bloated-buckets.js'
import { checkStaleProjects } from './check-stale-projects.js'

export async function analyzeBuckets(userId: string): Promise<void> {
  try {
    const splits = await checkBloatedBuckets(userId)
    const archives = await checkStaleProjects(userId)

    if (splits > 0 || archives > 0) {
      console.log(
        `[analyzeBuckets] userId=${userId}: ${splits} split suggestions, ${archives} archive suggestions`,
      )
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[analyzeBuckets] userId=${userId}:`, msg)
  }
}
