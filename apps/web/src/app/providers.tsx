import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/features/theme'
import { ToastContainer } from '@/components/shared/ToastContainer'

type ProvidersProps = {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
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
