import { type ReactNode } from 'react'

export function Table({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-sm ${className}`}>{children}</table>
    </div>
  )
}

export function Thead({ children }: { children: ReactNode }) {
  return <thead className="border-b border-[#f0f0f0]">{children}</thead>
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
        px-5 py-3 text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider
        ${sortable ? 'cursor-pointer hover:text-[#6b7280] select-none' : ''}
        ${className}
      `}
    >
      {children}
    </th>
  )
}

export function Tbody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-[#f7f7f7]">{children}</tbody>
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
        transition-colors duration-75
        ${onClick ? 'cursor-pointer hover:bg-[#fafafa]' : 'hover:bg-[#fafafa]'}
        ${className}
      `}
    >
      {children}
    </tr>
  )
}

export function Td({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <td className={`px-5 py-3.5 text-[#374151] ${className}`}>{children}</td>
  )
}

export function EmptyRow({ cols, message = 'No records found' }: { cols: number; message?: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-5 py-16 text-center text-[#9ca3af] text-sm">
        {message}
      </td>
    </tr>
  )
}
