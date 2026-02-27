import { TelegramSettingsCard } from './TelegramSettingsCard'
import { AppearanceCard } from './AppearanceCard'
import { ShortcutsCard } from './ShortcutsCard'
import { AccountCard } from './AccountCard'

export function SettingsView() {
  return (
    <div className="mx-auto max-w-[640px] px-6 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-surface-700">Settings</h1>
      <div className="space-y-6">
        <TelegramSettingsCard />
        <AppearanceCard />
        <ShortcutsCard />
        <AccountCard />
      </div>
    </div>
  )
}
