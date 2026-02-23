const activeUsers = new Set<string>()

export function setOnboarding(userId: string): void {
  activeUsers.add(userId)
}

export function isOnboarding(userId: string): boolean {
  return activeUsers.has(userId)
}

export function clearOnboarding(userId: string): void {
  activeUsers.delete(userId)
}
