'use client'
import { type TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-medium text-[#374151] uppercase tracking-wide">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full px-3 py-2 text-sm rounded-md resize-none
            bg-white border text-[#111827] placeholder-[#9ca3af]
            transition-colors duration-100
            ${error
              ? 'border-[#dc2626]'
              : 'border-[#e5e7eb] focus:outline-none focus:ring-1 focus:ring-[#5c5fef] focus:border-transparent'
            }
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-[#dc2626]">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
