'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('admin@pacificoffice.com')
  const [password, setPassword] = useState('demo1234')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    // Demo login — any credentials work
    await new Promise(r => setTimeout(r, 600))
    if (!email || !password) {
      setError('Please enter your email and password')
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#00d4ff05_0%,transparent_70%)]" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-[#00d4ff] rounded-lg flex items-center justify-center">
            <Zap className="w-4.5 h-4.5 text-[#0a0a0a]" fill="currentColor" />
          </div>
          <div>
            <div className="text-base font-bold text-white tracking-tight font-mono">DealerOS</div>
            <div className="text-[11px] text-[#444]">Office Technology ERP</div>
          </div>
        </div>

        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-6">
          <h1 className="text-base font-semibold text-[#e8e8e8] mb-0.5">Sign in</h1>
          <p className="text-sm text-[#555] mb-5">Enter your credentials to access your account</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            {error && (
              <div className="text-xs text-[#ef4444] bg-[#ef44441a] border border-[#ef444433] rounded px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="md" className="w-full" loading={loading}>
              {!loading && <ArrowRight className="w-4 h-4" />}
              Sign in
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-[#1a1a1a]">
            <p className="text-[11px] text-[#444] text-center">
              Demo account: <span className="text-[#666] font-mono">admin@pacificoffice.com</span>
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-[#333] mt-4">
          DealerOS v0.1 · Pacific Office Solutions
        </p>
      </div>
    </div>
  )
}
