import type { Request, Response, NextFunction } from 'express'
import { getServiceClient } from '@second-brain/db'
import { DEFAULT_PARA_BUCKETS } from '@second-brain/shared'

const initialized = new Set<string>()

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

  const sb = getServiceClient()

  sb.from('para_buckets')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .then(({ count }) => {
      if (count && count > 0) {
        initialized.add(userId)
        next()
        return
      }

      const rows = DEFAULT_PARA_BUCKETS.map((b) => ({
        user_id: userId,
        name: b.name,
        type: b.type,
      }))

      sb.from('para_buckets')
        .insert(rows)
        .then(() => {
          initialized.add(userId)
          next()
        })
    })
}
