import type { ReactNode } from 'react'

interface MainContentProps {
  children: ReactNode
}

export function MainContent({ children }: MainContentProps) {
  return (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="max-w-[1000px] mx-auto">
        {children}
      </div>
    </main>
  )
}
