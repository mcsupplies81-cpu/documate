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
    <div className="flex items-center gap-0.5 p-0.5 bg-[#efede9] rounded-[10px] border border-[#e7e5e1]">
      {options.map(opt => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`
            flex items-center gap-1.5 px-3 h-7 text-xs rounded-lg transition-colors whitespace-nowrap
            ${value === opt.key
              ? 'bg-white text-[#171717] font-medium shadow-[0_1px_2px_rgba(17,17,17,0.04)]'
              : 'text-[#737373] hover:text-[#171717]'
            }
          `}
        >
          <span>{opt.label}</span>
          {opt.count !== undefined && (
            <span className={`tabular-nums font-normal ${value === opt.key ? 'text-[#a3a3a3]' : 'text-[#a3a3a3]'}`}>
              {opt.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
