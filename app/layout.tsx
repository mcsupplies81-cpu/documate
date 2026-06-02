import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DealerOS — The ERP copier dealers actually want to use',
  description: 'Modern ERP for independent office technology dealers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-[#0a0a0a] text-[#e8e8e8] antialiased">{children}</body>
    </html>
  )
}
