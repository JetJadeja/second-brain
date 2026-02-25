import { CheckCircle } from 'lucide-react'

export function InboxEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 animate-in fade-in duration-200">
      <CheckCircle size={32} className="text-green-500" />
      <p className="text-body text-surface-500">You're all caught up.</p>
      <p className="text-body-sm text-surface-300">
        Notes you send to the Telegram bot will appear here.
      </p>
    </div>
  )
}
