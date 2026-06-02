'use client'
import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-[#111111] text-white hover:bg-[#262626] border border-[#111111] shadow-[0_1px_2px_rgba(17,17,17,0.12)] font-medium',
  secondary: 'bg-white text-[#171717] hover:bg-[#f8f8f6] border border-[#e7e5e1]',
  ghost: 'bg-transparent text-[#737373] hover:text-[#171717] hover:bg-[#efede9]',
  danger: 'bg-[#fff7f7] text-[#b91c1c] hover:bg-[#fee2e2] border border-[#fecaca]',
  outline: 'bg-transparent text-[#171717] border border-[#e7e5e1] hover:bg-[#f8f8f6]',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 h-8 text-[13px] gap-1.5',
  md: 'px-4 h-9 text-sm gap-2',
  lg: 'px-5 h-10 text-sm gap-2',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', children, loading, className = '', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center rounded-[10px] transition-colors duration-150
          disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-medium
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/20 focus-visible:ring-offset-1
          ${variants[variant]} ${sizes[size]} ${className}
        `}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
