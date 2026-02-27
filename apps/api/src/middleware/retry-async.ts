const RETRY_DELAY_MS = 500

/**
 * Wraps an async operation with a single delayed retry.
 * Logs failures but never throws — suitable for fire-and-forget writes.
 */
export function fireAndRetry(
  label: string,
  fn: () => Promise<void>,
): void {
  Promise.resolve()
    .then(fn)
    .catch((err) => {
      console.error(`[${label}] first attempt failed:`, err)
      setTimeout(() => {
        Promise.resolve()
          .then(fn)
          .catch((retryErr) => {
            console.error(`[${label}] retry failed:`, retryErr)
          })
      }, RETRY_DELAY_MS)
    })
}
