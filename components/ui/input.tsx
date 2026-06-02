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
          <label htmlFor={inputId} className="text-[11px] font-medium text-[#737373]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 h-9 text-sm rounded-[10px]
            bg-white border text-[#171717] placeholder-[#a3a3a3]
            transition-colors duration-150
            ${error
              ? 'border-[#dc2626] focus:outline-none focus:ring-1 focus:ring-[#dc2626]'
              : 'border-[#e7e5e1] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/15 focus:border-[#2563eb]/50'
            }
            ${className}
          `}
          {...props}
        />
        {hint && !error && <p className="text-xs text-[#737373]">{hint}</p>}
        {error && <p className="text-xs text-[#dc2626]">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
