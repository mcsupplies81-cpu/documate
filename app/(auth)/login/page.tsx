'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const DEMO_USERS = [
  { email: 'admin@pacificoffice.com', password: 'demo1234', name: 'Jordan Martinez', role: 'Admin' },
  { email: 'service@pacificoffice.com', password: 'demo1234', name: 'Alex Chen', role: 'Service Manager' },
  { email: 'billing@pacificoffice.com', password: 'demo1234', name: 'Sam Rivera', role: 'Billing' },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('admin@pacificoffice.com')
  const [password, setPassword] = useState('demo1234')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    await new Promise(r => setTimeout(r, 500))

    const user = DEMO_USERS.find(u => u.email === email && u.password === password)
    if (!user) {
      setError('Invalid credentials. Try admin@pacificoffice.com / demo1234')
      setLoading(false)
      return
    }

    document.cookie = `demo_session=${encodeURIComponent(JSON.stringify({ email: user.email, name: user.name, role: user.role }))}; path=/; max-age=86400`
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#f6f5f2] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-9 h-9 bg-[#2563eb] rounded-lg flex items-center justify-center shadow-md">
            <Zap className="w-5 h-5 text-white" fill="currentColor" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#111827] tracking-tight">DealerOS</div>
            <div className="text-[11px] text-[#9ca3af]">Office Technology ERP</div>
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 shadow-[0_18px_50px_rgba(17,17,17,0.08)]">
          <h1 className="text-base font-semibold text-[#111827] mb-0.5">Welcome back</h1>
          <p className="text-sm text-[#6b7280] mb-6">Sign in to your account</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#374151] uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-3 h-9 pr-10 text-sm rounded-md bg-white border border-[#e5e7eb] text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="md" className="w-full mt-2" loading={loading}>
              {!loading && <ArrowRight className="w-4 h-4" />}
              Sign in
            </Button>
          </form>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 bg-white border border-[#e5e7eb] rounded-lg p-3 shadow-[0_1px_2px_rgba(17,17,17,0.03)]">
          <p className="text-[11px] text-[#9ca3af] mb-2 uppercase tracking-wide font-medium">Demo accounts</p>
          <div className="space-y-0.5">
            {DEMO_USERS.map(u => (
              <button
                key={u.email}
                onClick={() => { setEmail(u.email); setPassword(u.password) }}
                className="w-full text-left flex items-center justify-between px-2 py-1.5 rounded hover:bg-[#f9fafb] transition-colors group"
              >
                <span className="text-[11px] text-[#6b7280] group-hover:text-[#374151] font-mono">{u.email}</span>
                <span className="text-[10px] text-[#9ca3af] group-hover:text-[#6b7280]">{u.role}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-[11px] text-[#9ca3af] mt-4">
          DealerOS v0.1 — Pacific Office Solutions
        </p>
      </div>
    </div>
  )
}
