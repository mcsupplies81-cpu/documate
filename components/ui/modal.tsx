'use client'
import { type ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizes = {
  sm: 'w-[400px]',
  md: 'w-[480px]',
  lg: 'w-[600px]',
  xl: 'w-[720px]',
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />

      {/* Slide panel from right */}
      <div className={`absolute right-0 top-0 bottom-0 ${sizes[size]} bg-white border-l border-[#e5e7eb] shadow-2xl slide-panel flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb] flex-shrink-0">
          <h2 className="text-sm font-semibold text-[#111827]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#9ca3af] hover:text-[#374151] transition-colors p-1 rounded hover:bg-[#f3f4f6]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}
