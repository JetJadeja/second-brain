import type { Request, Response, NextFunction } from 'express'
import { getServiceClient } from '@second-brain/db'
import { DEFAULT_PARA_BUCKETS } from '@second-brain/shared'

const MAX_CACHE_SIZE = 10_000
const initialized = new Set<string>()
const pending = new Map<string, Promise<void>>()

export function ensureDefaultBuckets(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const userId = req.userId
  if (!userId || initialized.has(userId)) {
    next()
    return
  }

  const inflight = pending.get(userId) ?? initBuckets(userId)
  if (!pending.has(userId)) {
    pending.set(userId, inflight)
    inflight.finally(() => pending.delete(userId))
  }

  inflight
    .then(() => next())
    .catch((err: unknown) => next(err))
}

async function initBuckets(userId: string): Promise<void> {
  const sb = getServiceClient()

  const { count, error } = await sb
    .from('para_buckets')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) throw new Error(`ensureDefaultBuckets check: ${error.message}`)

  if (count && count > 0) {
    addToCache(userId)
    return
  }

  const rows = DEFAULT_PARA_BUCKETS.map((b) => ({
    user_id: userId,
    name: b.name,
    type: b.type,
  }))

  const { error: insertError } = await sb
    .from('para_buckets')
    .insert(rows)

  if (insertError) throw new Error(`ensureDefaultBuckets insert: ${insertError.message}`)

  addToCache(userId)
}

function addToCache(userId: string): void {
  if (initialized.size >= MAX_CACHE_SIZE) {
    const first = initialized.values().next().value
    if (first) initialized.delete(first)
  }
  initialized.add(userId)
}
