import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pacific Office Solutions — Meter Submission',
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8]">
      {children}
    </div>
  )
}
