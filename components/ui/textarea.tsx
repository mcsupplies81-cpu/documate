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
          <label htmlFor={textareaId} className="text-xs font-medium text-[#888] uppercase tracking-wide">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full px-3 py-2 text-sm rounded-md resize-none
            bg-[#111] border text-[#e8e8e8] placeholder-[#444]
            transition-colors duration-100
            ${error ? 'border-[#ef4444]' : 'border-[#222] focus:outline-none focus:ring-1 focus:ring-[#00d4ff] focus:border-transparent'}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-[#ef4444]">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
