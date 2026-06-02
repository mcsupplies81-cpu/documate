'use client'
import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-[#5c5fef] text-white hover:bg-[#4f52d9] font-medium',
  secondary: 'bg-white text-[#374151] hover:bg-[#f9fafb] border border-[#e5e7eb]',
  ghost: 'bg-transparent text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6]',
  danger: 'bg-[#fef2f2] text-[#dc2626] hover:bg-[#fee2e2] border border-[#fecaca]',
  outline: 'bg-transparent text-[#374151] border border-[#e5e7eb] hover:bg-[#f9fafb]',
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
          inline-flex items-center justify-center rounded-md transition-colors duration-100
          disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-medium
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
