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
          <label htmlFor={textareaId} className="text-[11px] font-medium text-[#737373]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full px-3 py-2 text-sm rounded-[10px] resize-none
            bg-white border text-[#171717] placeholder-[#a3a3a3]
            transition-colors duration-150
            ${error
              ? 'border-[#dc2626]'
              : 'border-[#e7e5e1] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/15 focus:border-[#2563eb]/50'
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
