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
      <div className="absolute inset-0 bg-[#171717]/20 backdrop-blur-[3px]" onClick={onClose} />

      {/* Slide panel from right */}
      <div className={`absolute right-3 top-3 bottom-3 ${sizes[size]} bg-white border border-[#e7e5e1] rounded-2xl shadow-[0_24px_80px_rgba(17,17,17,0.14)] slide-panel flex flex-col overflow-hidden`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#eeecea] flex-shrink-0">
          <h2 className="text-sm font-semibold text-[#171717]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#a3a3a3] hover:text-[#171717] transition-colors p-1 rounded-lg hover:bg-[#f7f7f4]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}
