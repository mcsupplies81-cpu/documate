'use client'
import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-[#374151] uppercase tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 h-9 text-sm rounded-md
            bg-white border text-[#111827] placeholder-[#9ca3af]
            transition-colors duration-100
            ${error
              ? 'border-[#dc2626] focus:outline-none focus:ring-1 focus:ring-[#dc2626]'
              : 'border-[#e5e7eb] focus:outline-none focus:ring-1 focus:ring-[#5c5fef] focus:border-transparent'
            }
            ${className}
          `}
          {...props}
        />
        {hint && !error && <p className="text-xs text-[#6b7280]">{hint}</p>}
        {error && <p className="text-xs text-[#dc2626]">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
