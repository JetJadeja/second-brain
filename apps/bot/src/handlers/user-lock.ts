const LOCK_TIMEOUT_MS = 60 * 1000 // 60 seconds

const locks = new Map<string, Promise<void>>()

export async function withUserLock<T>(
  userId: string,
  fn: () => Promise<T>,
): Promise<T> {
  const previous = locks.get(userId) ?? Promise.resolve()

  const current = previous
    .catch(() => {})
    .then(() => withTimeout(fn, LOCK_TIMEOUT_MS))

  const voidCurrent = current.then(() => {}, () => {})
  locks.set(userId, voidCurrent)

  try {
    return await current
  } finally {
    if (locks.get(userId) === voidCurrent) {
      locks.delete(userId)
    }
  }
}

function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      console.warn('[user-lock] Lock holder exceeded timeout, proceeding')
      reject(new Error('Lock timeout'))
    }, timeoutMs)

    fn().then(
      (result) => { clearTimeout(timer); resolve(result) },
      (error) => { clearTimeout(timer); reject(error) },
    )
  })
}
