import { TelegramLink } from '../components/settings/TelegramLink'

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <h1 className="text-xl font-semibold text-text-primary">Settings</h1>
      <TelegramLink />
    </div>
  )
}
