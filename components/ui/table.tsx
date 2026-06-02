import { type ReactNode, type ElementType } from 'react'

export function Table({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-[13px] ${className}`}>{children}</table>
    </div>
  )
}

export function Thead({ children }: { children: ReactNode }) {
  return <thead className="border-b border-[#eeecea] bg-[#fbfaf8]">{children}</thead>
}

export function Th({ children, className = '', onClick, sortable }: {
  children?: ReactNode
  className?: string
  onClick?: () => void
  sortable?: boolean
}) {
  return (
    <th
      onClick={onClick}
      className={`
        px-4 py-2.5 text-left text-[11px] font-medium text-[#737373] tracking-wide
        ${sortable ? 'cursor-pointer hover:text-[#171717] select-none' : ''}
        ${className}
      `}
    >
      {children}
    </th>
  )
}

export function Tbody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-[#eeecea] bg-white">{children}</tbody>
}

export function Tr({ children, onClick, className = '' }: {
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <tr
      onClick={onClick}
      className={`
        transition-colors duration-100
        ${onClick ? 'cursor-pointer hover:bg-[#fbfaf8]' : 'hover:bg-[#fbfaf8]'}
        ${className}
      `}
    >
      {children}
    </tr>
  )
}

export function Td({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <td className={`px-4 py-3 text-[#374151] align-middle ${className}`}>{children}</td>
  )
}

export function EmptyRow({ cols, message = 'No records found', icon: Icon }: {
  cols: number
  message?: string
  icon?: ElementType
}) {
  return (
    <tr>
      <td colSpan={cols} className="px-5 py-16 text-center">
        {Icon && <Icon className="w-8 h-8 text-[#d6d3ce] mx-auto mb-3" strokeWidth={1.5} />}
        <p className="text-sm text-[#a3a3a3]">{message}</p>
      </td>
    </tr>
  )
}
