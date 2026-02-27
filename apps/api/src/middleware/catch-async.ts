import type { Request, Response, NextFunction } from 'express'

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>
type SyncRouteHandler = (req: Request, res: Response, next: NextFunction) => void

/**
 * Wraps an async Express route handler so rejected promises
 * are forwarded to Express error middleware via next(err).
 */
export function catchAsync(fn: AsyncRouteHandler): SyncRouteHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next)
  }
}

/**
 * Safely extract a route parameter as a string.
 * Express 5 types params values as string | string[].
 */
export function param(req: Request, name: string): string {
  const value = req.params[name]
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}
