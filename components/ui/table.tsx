import { type ReactNode } from 'react'

export function Table({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-sm ${className}`}>{children}</table>
    </div>
  )
}

export function Thead({ children }: { children: ReactNode }) {
  return <thead className="border-b border-[#1e1e1e]">{children}</thead>
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
        px-3 py-2.5 text-left text-[11px] font-medium text-[#555] uppercase tracking-wider
        ${sortable ? 'cursor-pointer hover:text-[#888] select-none' : ''}
        ${className}
      `}
    >
      {children}
    </th>
  )
}

export function Tbody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-[#1a1a1a]">{children}</tbody>
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
        ${onClick ? 'cursor-pointer hover:bg-[#141414]' : ''}
        ${className}
      `}
    >
      {children}
    </tr>
  )
}

export function Td({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <td className={`px-3 py-2.5 text-[#c0c0c0] ${className}`}>{children}</td>
  )
}

export function EmptyRow({ cols, message = 'No records found' }: { cols: number; message?: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-3 py-12 text-center text-[#444] text-sm">
        {message}
      </td>
    </tr>
  )
}
