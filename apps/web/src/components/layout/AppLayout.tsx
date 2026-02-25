import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { ContentArea } from './ContentArea'

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />
      <ContentArea>
        <Outlet />
      </ContentArea>
    </div>
  )
}
