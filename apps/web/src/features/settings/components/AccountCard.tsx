import { User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'

export function AccountCard() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="rounded-xl border border-surface-200 bg-surface-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <User className="size-4 text-surface-400" />
        <h2 className="text-[15px] font-semibold text-surface-700">Account</h2>
      </div>

      <p className="text-[15px] text-surface-500">{user?.email ?? 'No email'}</p>

      <button
        type="button"
        onClick={handleSignOut}
        className="mt-4 rounded-md px-4 py-2 text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
      >
        Sign out
      </button>
    </div>
  )
}
