import { useLocation } from 'react-router-dom'

export function PlaceholderPage({ title }: { title: string }) {
  const { pathname } = useLocation()

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
      <h1 className="font-display text-surface-700 mb-2">{title}</h1>
      <p className="font-body-sm text-surface-400">{pathname}</p>
    </div>
  )
}
