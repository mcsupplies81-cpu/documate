'use client'
import { type SelectHTMLAttributes, forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options?: { value: string; label: string }[]
  placeholder?: string
  children?: React.ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, children, className = '', id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-medium text-[#374151] uppercase tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full px-3 h-9 text-sm rounded-md appearance-none pr-8
              bg-white border text-[#111827]
              transition-colors duration-100
              ${error ? 'border-[#dc2626]' : 'border-[#e5e7eb] focus:outline-none focus:ring-1 focus:ring-[#5c5fef] focus:border-transparent'}
              ${className}
            `}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {children
              ? children
              : options?.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))
            }
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af] pointer-events-none" />
        </div>
        {error && <p className="text-xs text-[#dc2626]">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
