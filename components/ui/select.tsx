'use client'
import { type SelectHTMLAttributes, forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-medium text-[#888] uppercase tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full px-3 py-2 text-sm rounded-md appearance-none pr-8
              bg-[#111] border text-[#e8e8e8]
              transition-colors duration-100
              ${error ? 'border-[#ef4444]' : 'border-[#222] focus:outline-none focus:ring-1 focus:ring-[#00d4ff] focus:border-transparent'}
              ${className}
            `}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555] pointer-events-none" />
        </div>
        {error && <p className="text-xs text-[#ef4444]">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
