import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'cta' | 'auth'

const variants: Record<ButtonVariant, string> = {
  primary:
    'px-5 py-2 font-semibold text-surface bg-btn-primary rounded hover:bg-btn-primary-hover focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed',
  secondary:
    'px-4 py-2 text-sm font-medium text-btn-secondary-text bg-btn-secondary rounded hover:bg-btn-secondary-hover focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-surface',
  cta:
    'px-8 py-3 font-semibold text-surface bg-btn-cta rounded-md hover:bg-btn-cta-hover shadow-md focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-surface',
  auth:
    'px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export function Button({ variant = 'primary', type = 'button', className = '', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`${variants[variant]} ${className}`}
      {...props}
    />
  )
}
