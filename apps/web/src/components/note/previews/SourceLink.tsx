import { ExternalLink } from 'lucide-react'

interface SourceLinkProps {
  url: string
  domain?: string
  label?: string
}

export function SourceLink({ url, domain, label }: SourceLinkProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm text-blue-500 hover:underline"
    >
      <ExternalLink size={12} className="flex-shrink-0" />
      <span>{label ?? domain ?? 'View original'}</span>
    </a>
  )
}
