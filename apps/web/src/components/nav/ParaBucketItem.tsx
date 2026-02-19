import { Link, useLocation } from 'react-router-dom'

interface ParaBucketItemProps {
  name: string
  href: string
}

export function ParaBucketItem({ name, href }: ParaBucketItemProps) {
  const { pathname } = useLocation()
  const isActive = pathname === href

  return (
    <Link
      to={href}
      className={`block px-4 py-1 text-sm ${
        isActive ? 'text-text-primary font-medium' : 'text-text-secondary hover:text-text-primary'
      }`}
    >
      {name}
    </Link>
  )
}
