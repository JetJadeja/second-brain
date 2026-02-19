import type { InputHTMLAttributes } from 'react'

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function AuthInput({ label, id, ...props }: AuthInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block mb-2 text-sm font-bold text-gray-700">
        {label}
      </label>
      <input
        id={id}
        className="w-full px-3 py-2 text-gray-700 border rounded focus:outline-none focus:ring focus:border-blue-300"
        {...props}
      />
    </div>
  )
}
