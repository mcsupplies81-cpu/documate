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
          <label htmlFor={inputId} className="text-xs font-medium text-[#888] uppercase tracking-wide">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 py-2 text-sm rounded-md
            bg-[#111] border text-[#e8e8e8] placeholder-[#444]
            transition-colors duration-100
            ${error ? 'border-[#ef4444] focus:outline-none focus:ring-1 focus:ring-[#ef4444]' : 'border-[#222] focus:outline-none focus:ring-1 focus:ring-[#00d4ff] focus:border-transparent'}
            ${className}
          `}
          {...props}
        />
        {hint && !error && <p className="text-xs text-[#555]">{hint}</p>}
        {error && <p className="text-xs text-[#ef4444]">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
