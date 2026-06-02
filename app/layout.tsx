import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DocuMate — Calm ERP for office technology teams',
  description: 'A refined agentic ERP workspace for independent office technology dealers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-[#f6f5f2] text-[#171717] antialiased">{children}</body>
    </html>
  )
}
