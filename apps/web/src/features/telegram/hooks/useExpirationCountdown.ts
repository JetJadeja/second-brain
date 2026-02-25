import { useState, useEffect } from 'react'

type ExpirationCountdown = {
  timeLeft: string
  isExpired: boolean
  isUrgent: boolean
}

function formatTimeLeft(ms: number): string {
  if (ms <= 0) return '0:00'
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes >= 1) return `${minutes} minute${minutes === 1 ? '' : 's'}`
  return `0:${seconds.toString().padStart(2, '0')}`
}

export function useExpirationCountdown(expiresAt: string): ExpirationCountdown {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const expiresMs = new Date(expiresAt).getTime()
  const remaining = expiresMs - now

  return {
    timeLeft: formatTimeLeft(remaining),
    isExpired: remaining <= 0,
    isUrgent: remaining > 0 && remaining < 60_000,
  }
}
