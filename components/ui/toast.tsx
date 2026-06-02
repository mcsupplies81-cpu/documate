'use client'
import { useEffect } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToastStore, type Toast } from '@/lib/store'

const icons = {
  success: <CheckCircle2 className="w-4 h-4 text-[#16a34a] flex-shrink-0" />,
  error:   <XCircle className="w-4 h-4 text-[#dc2626] flex-shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-[#d97706] flex-shrink-0" />,
  info:    <Info className="w-4 h-4 text-[#2563eb] flex-shrink-0" />,
}

const borders = {
  success: 'border-[#bbf7d0]',
  error:   'border-[#fecaca]',
  warning: 'border-[#fde68a]',
  info:    'border-[#bfdbfe]',
}

function ToastItem({ toast }: { toast: Toast }) {
  const remove = useToastStore(s => s.remove)
  return (
    <div className={`flex items-start gap-3 bg-white border ${borders[toast.type]} rounded-lg px-4 py-3 shadow-lg shadow-black/10 min-w-[280px] max-w-sm`}>
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[#111827]">{toast.title}</div>
        {toast.message && <div className="text-xs text-[#6b7280] mt-0.5">{toast.message}</div>}
      </div>
      <button onClick={() => remove(toast.id)} className="text-[#9ca3af] hover:text-[#374151] transition-colors flex-shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useToastStore(s => s.toasts)
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  )
}
