import { type ReactNode, useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/features/theme'
import { ToastContainer } from '@/components/shared/ToastContainer'
import { useAuthStore } from '@/stores/auth.store'

type ProvidersProps = {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <BrowserRouter>
      <ThemeProvider>
        <TooltipProvider delayDuration={300}>
          {children}
          <ToastContainer />
        </TooltipProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
