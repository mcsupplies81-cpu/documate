import { PageHeader } from '@/components/page-header'
import { MOCK_TENANT, MOCK_USERS } from '@/lib/mock-data'

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      <div className="grid grid-cols-2 gap-4 max-w-4xl">
        <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-5">
          <h3 className="text-sm font-semibold text-[#e8e8e8] mb-4">Organization</h3>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-[#555] uppercase tracking-wide mb-1">Company Name</div>
              <div className="text-sm text-[#888]">{MOCK_TENANT.name}</div>
            </div>
            <div>
              <div className="text-xs text-[#555] uppercase tracking-wide mb-1">Subdomain</div>
              <div className="text-sm text-[#888] font-mono">{MOCK_TENANT.subdomain}.dealeros.app</div>
            </div>
            <div>
              <div className="text-xs text-[#555] uppercase tracking-wide mb-1">Created</div>
              <div className="text-sm text-[#888]">{new Date(MOCK_TENANT.created_at).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-5">
          <h3 className="text-sm font-semibold text-[#e8e8e8] mb-4">Billing Defaults</h3>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-[#555] uppercase tracking-wide mb-1">Default Payment Terms</div>
              <div className="text-sm text-[#888]">Net 30</div>
            </div>
            <div>
              <div className="text-xs text-[#555] uppercase tracking-wide mb-1">Tax Rate</div>
              <div className="text-sm text-[#888]">0% (tax-exempt)</div>
            </div>
            <div>
              <div className="text-xs text-[#555] uppercase tracking-wide mb-1">Invoice Prefix</div>
              <div className="text-sm text-[#888] font-mono">INV-2026-</div>
            </div>
          </div>
        </div>

        <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-5 col-span-2">
          <h3 className="text-sm font-semibold text-[#e8e8e8] mb-4">Team Members</h3>
          <div className="space-y-2">
            {MOCK_USERS.map(user => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[10px] text-[#888] font-mono">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm text-[#e8e8e8]">{user.name}</div>
                    <div className="text-xs text-[#555]">{user.email}</div>
                  </div>
                </div>
                <span className="text-xs text-[#555] bg-[#1a1a1a] px-2 py-0.5 rounded capitalize">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-5 col-span-2">
          <h3 className="text-sm font-semibold text-[#e8e8e8] mb-2">Database</h3>
          <p className="text-xs text-[#555] mb-3">Connect this account to a Supabase project to enable real data persistence.</p>
          <div className="space-y-2">
            {[
              { label: 'NEXT_PUBLIC_SUPABASE_URL', value: 'Not configured' },
              { label: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: 'Not configured' },
            ].map(env => (
              <div key={env.label} className="flex items-center justify-between bg-[#0d0d0d] rounded px-3 py-2">
                <span className="text-xs font-mono text-[#555]">{env.label}</span>
                <span className="text-xs text-[#444]">{env.value}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#444] mt-2">Add these to your <span className="font-mono">.env.local</span> file to connect to Supabase.</p>
        </div>
      </div>
    </div>
  )
}
