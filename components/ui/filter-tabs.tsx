'use client'

interface FilterOption<T extends string> {
  key: T
  label: string
  count?: number
}

export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: FilterOption<T>[]
  value: T
  onChange: (key: T) => void
}) {
  return (
    <div className="flex items-center gap-0.5 p-0.5 bg-[#f3f4f6] rounded-lg">
      {options.map(opt => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`
            flex items-center gap-1.5 px-3 h-7 text-xs rounded-md transition-colors whitespace-nowrap
            ${value === opt.key
              ? 'bg-white text-[#111827] font-semibold shadow-sm'
              : 'text-[#6b7280] hover:text-[#374151]'
            }
          `}
        >
          <span>{opt.label}</span>
          {opt.count !== undefined && (
            <span className={`tabular-nums font-normal ${value === opt.key ? 'text-[#9ca3af]' : 'text-[#c4c9d4]'}`}>
              {opt.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
