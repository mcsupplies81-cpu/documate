import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DealerOS — The ERP copier dealers actually want to use',
  description: 'Modern ERP for independent office technology dealers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-[#f7f8fb] text-[#111827] antialiased">{children}</body>
    </html>
  )
}
