import { Sidebar } from '@/components/sidebar'
import { ToastContainer } from '@/components/ui/toast'
import { CommandPalette } from '@/components/command-palette'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#f7f8fb]">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-8 py-8">
          {children}
        </div>
      </main>
      <CommandPalette />
      <ToastContainer />
    </div>
  )
}
