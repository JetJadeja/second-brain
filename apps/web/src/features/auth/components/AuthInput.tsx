import { cn } from '@/lib/utils'

export type AuthInputProps = {
  label: string
  type: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  hasError: boolean
  shake: boolean
}

export function AuthInput({
  label,
  type,
  value,
  onChange,
  placeholder,
  hasError,
  shake,
}: AuthInputProps) {
  return (
    <div>
      <label className="block font-body-sm text-surface-500 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full h-11 px-3 bg-surface-150 border rounded-md font-body text-surface-700 placeholder:text-surface-300',
          'transition-all duration-150 outline-none',
          'focus:border-ember-500 focus:shadow-[0_0_0_3px_rgba(238,69,64,0.15)]',
          hasError && shake
            ? 'border-danger animate-[input-shake_300ms_ease-out]'
            : hasError
              ? 'border-danger'
              : 'border-surface-200',
        )}
      />
    </div>
  )
}
