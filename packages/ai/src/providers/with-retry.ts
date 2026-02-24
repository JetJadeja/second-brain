import Anthropic from '@anthropic-ai/sdk'

interface RetryOptions {
  maxRetries?: number
  delayMs?: number
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts?: RetryOptions,
): Promise<T> {
  const maxRetries = opts?.maxRetries ?? 1
  const delayMs = opts?.delayMs ?? 1000

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: unknown) {
      if (attempt < maxRetries && isRetryable(error)) {
        await sleep(delayMs)
        continue
      }
      throw error
    }
  }

  throw new Error('withRetry: exhausted retries')
}

export function isRetryable(error: unknown): boolean {
  if (error instanceof Anthropic.APIError) {
    return error.status === 429 || error.status === 529
  }
  return false
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
