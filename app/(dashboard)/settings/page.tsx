import { PageHeader } from '@/components/page-header'
import { MOCK_TENANT, MOCK_USERS } from '@/lib/mock-data'

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      <div className="grid grid-cols-2 gap-4 max-w-4xl">
        <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h3 className="text-sm font-semibold text-[#111827] mb-4">Organization</h3>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-[#6b7280] uppercase tracking-wide font-medium mb-1">Company Name</div>
              <div className="text-sm text-[#374151]">{MOCK_TENANT.name}</div>
            </div>
            <div>
              <div className="text-xs text-[#6b7280] uppercase tracking-wide font-medium mb-1">Subdomain</div>
              <div className="text-sm text-[#374151] font-mono">{MOCK_TENANT.subdomain}.dealeros.app</div>
            </div>
            <div>
              <div className="text-xs text-[#6b7280] uppercase tracking-wide font-medium mb-1">Created</div>
              <div className="text-sm text-[#374151]">{new Date(MOCK_TENANT.created_at).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h3 className="text-sm font-semibold text-[#111827] mb-4">Billing Defaults</h3>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-[#6b7280] uppercase tracking-wide font-medium mb-1">Default Payment Terms</div>
              <div className="text-sm text-[#374151]">Net 30</div>
            </div>
            <div>
              <div className="text-xs text-[#6b7280] uppercase tracking-wide font-medium mb-1">Tax Rate</div>
              <div className="text-sm text-[#374151]">0% (tax-exempt)</div>
            </div>
            <div>
              <div className="text-xs text-[#6b7280] uppercase tracking-wide font-medium mb-1">Invoice Prefix</div>
              <div className="text-sm text-[#374151] font-mono">INV-2026-</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 col-span-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h3 className="text-sm font-semibold text-[#111827] mb-4">Team Members</h3>
          <div className="space-y-1">
            {MOCK_USERS.map(user => (
              <div key={user.id} className="flex items-center justify-between py-2.5 border-b border-[#f3f4f6] last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#f0f0ff] border border-[#5c5fef33] flex items-center justify-center text-[10px] text-[#5c5fef] font-semibold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm text-[#111827] font-medium">{user.name}</div>
                    <div className="text-xs text-[#6b7280]">{user.email}</div>
                  </div>
                </div>
                <span className="text-xs text-[#6b7280] bg-[#f3f4f6] border border-[#e5e7eb] px-2.5 py-0.5 rounded-full capitalize font-medium">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 col-span-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h3 className="text-sm font-semibold text-[#111827] mb-1">Database</h3>
          <p className="text-xs text-[#6b7280] mb-3">Connect this account to a Supabase project to enable real data persistence.</p>
          <div className="space-y-2">
            {[
              { label: 'NEXT_PUBLIC_SUPABASE_URL', value: 'Not configured' },
              { label: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: 'Not configured' },
            ].map(env => (
              <div key={env.label} className="flex items-center justify-between bg-[#f9fafb] border border-[#e5e7eb] rounded px-3 py-2">
                <span className="text-xs font-mono text-[#374151]">{env.label}</span>
                <span className="text-xs text-[#9ca3af]">{env.value}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#9ca3af] mt-2">Add these to your <span className="font-mono text-[#374151]">.env.local</span> file to connect to Supabase.</p>
        </div>
      </div>
    </div>
  )
}
