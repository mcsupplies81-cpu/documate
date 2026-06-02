import { Sidebar } from '@/components/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 ml-[200px] overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-6 py-5">
          {children}
        </div>
      </main>
    </div>
  )
}
