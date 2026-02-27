/**
 * Wraps an async operation with a single retry.
 * Logs failures but never throws — suitable for fire-and-forget writes.
 */
export function fireAndRetry(
  label: string,
  fn: () => Promise<void>,
): void {
  fn().catch((err) => {
    console.error(`[${label}] first attempt failed:`, err)
    fn().catch((retryErr) => {
      console.error(`[${label}] retry failed:`, retryErr)
    })
  })
}
