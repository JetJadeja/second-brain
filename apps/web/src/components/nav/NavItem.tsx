import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

interface NavItemProps {
  label: string
  href: string
  icon?: LucideIcon
  hint?: string
  children?: ReactNode
}

export function NavItem({ label, href, icon: Icon, hint, children }: NavItemProps) {
  const { pathname } = useLocation()
  const isActive = pathname === href

  return (
    <Link
      to={href}
      className={`flex items-center justify-between px-4 py-1.5 text-sm ${
        isActive ? 'text-text-primary font-medium bg-active' : 'text-text-secondary hover:bg-hover'
      }`}
    >
      <span className="flex items-center gap-2">
        {Icon && <Icon size={16} />}
        {label}
      </span>
      <span className="flex items-center gap-2">
        {hint && <span className="text-xs text-text-tertiary">{hint}</span>}
        {children}
      </span>
    </Link>
  )
}
