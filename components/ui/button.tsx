'use client'
import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-[#00d4ff] text-[#0a0a0a] hover:bg-[#00bde8] font-semibold',
  secondary: 'bg-[#1a1a1a] text-[#e8e8e8] hover:bg-[#222] border border-[#2a2a2a]',
  ghost: 'bg-transparent text-[#888] hover:text-[#e8e8e8] hover:bg-[#111]',
  danger: 'bg-[#ef44441a] text-[#ef4444] hover:bg-[#ef444433] border border-[#ef444433]',
  outline: 'bg-transparent text-[#e8e8e8] border border-[#2a2a2a] hover:bg-[#111] hover:border-[#333]',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-sm gap-2',
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
          disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer
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
