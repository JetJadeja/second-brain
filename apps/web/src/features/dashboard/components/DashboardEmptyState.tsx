import { useNavigate } from 'react-router-dom'

export function DashboardEmptyState() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center py-12">
      <svg width="120" height="80" viewBox="0 0 120 80" fill="none" className="opacity-60">
        {/* Network graph outline */}
        <circle cx="30" cy="25" r="6" stroke="currentColor" className="text-surface-200" strokeWidth="1.5" />
        <circle cx="75" cy="15" r="5" stroke="currentColor" className="text-surface-200" strokeWidth="1.5" />
        <circle cx="90" cy="50" r="5" stroke="currentColor" className="text-surface-200" strokeWidth="1.5" />
        <circle cx="45" cy="60" r="4" stroke="currentColor" className="text-surface-200" strokeWidth="1.5" />
        {/* The bright ember node */}
        <circle cx="60" cy="38" r="7" fill="#EE4540" opacity="0.9" />
        <circle cx="60" cy="38" r="12" fill="#EE4540" opacity="0.1" />
        {/* Connecting lines */}
        <line x1="36" y1="27" x2="53" y2="36" stroke="currentColor" className="text-surface-200" strokeWidth="1" />
        <line x1="67" y1="40" x2="85" y2="48" stroke="currentColor" className="text-surface-200" strokeWidth="1" />
        <line x1="62" y1="31" x2="72" y2="18" stroke="currentColor" className="text-surface-200" strokeWidth="1" />
        <line x1="55" y1="43" x2="47" y2="56" stroke="currentColor" className="text-surface-200" strokeWidth="1" />
      </svg>

      <p className="mt-4 font-body text-surface-400 text-center max-w-[320px]">
        Your brain is empty. Connect Telegram and start capturing.
      </p>

      <button
        type="button"
        onClick={() => navigate('/settings')}
        className="mt-4 h-9 px-4 border border-surface-200 rounded-md font-body-sm text-surface-500 transition-colors hover:border-surface-300 hover:text-surface-600"
      >
        Send your first capture →
      </button>
    </div>
  )
}
