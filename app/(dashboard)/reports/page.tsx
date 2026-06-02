'use client'
import { PageHeader } from '@/components/page-header'
import { formatCurrency } from '@/lib/billing'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const revenueData = [
  { month: 'Jan', base: 1490, overages: 580, service: 240 },
  { month: 'Feb', base: 1490, overages: 720, service: 180 },
  { month: 'Mar', base: 1535, overages: 650, service: 320 },
  { month: 'Apr', base: 1535, overages: 890, service: 210 },
  { month: 'May', base: 1535, overages: 788, service: 295 },
  { month: 'Jun', base: 1535, overages: 0, service: 0 },
]

const serviceData = [
  { month: 'Jan', open: 2, closed: 8, avg_hours: 14 },
  { month: 'Feb', open: 3, closed: 11, avg_hours: 10 },
  { month: 'Mar', open: 1, closed: 9, avg_hours: 12 },
  { month: 'Apr', open: 4, closed: 7, avg_hours: 16 },
  { month: 'May', open: 2, closed: 12, avg_hours: 9 },
  { month: 'Jun', open: 4, closed: 0, avg_hours: 0 },
]

const contractTypeData = [
  { name: 'CPC', value: 5, color: '#5c5fef' },
  { name: 'Flat Rate', value: 1, color: '#7c3aed' },
  { name: 'Block', value: 0, color: '#d97706' },
  { name: 'Equipment Only', value: 0, color: '#9ca3af' },
]

const meterVolumeData = [
  { month: 'Jan', bw: 285000, color: 87000 },
  { month: 'Feb', bw: 291000, color: 92000 },
  { month: 'Mar', bw: 302000, color: 88000 },
  { month: 'Apr', bw: 318000, color: 96000 },
  { month: 'May', bw: 808670, color: 235450 },
]

const TooltipStyle = {
  contentStyle: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  labelStyle: { color: '#6b7280', fontWeight: 600 },
  itemStyle: { color: '#374151' },
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-lg p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="mb-3">
        <div className="text-sm font-semibold text-[#111827]">{title}</div>
        {subtitle && <div className="text-xs text-[#9ca3af] mt-0.5">{subtitle}</div>}
      </div>
      {children}
    </div>
  )
}

const totalRevenue = revenueData.reduce((s, d) => s + d.base + d.overages + d.service, 0)
const totalOverages = revenueData.reduce((s, d) => s + d.overages, 0)
const avgOveragePct = Math.round((totalOverages / (totalRevenue - revenueData.reduce((s, d) => s + d.service, 0))) * 100)

export default function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="6-month rolling view · Jan – Jun 2026"
      />

      {/* Top KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Revenue YTD', value: formatCurrency(totalRevenue), sub: 'Base + overages + service', color: 'text-[#5c5fef]' },
          { label: 'Avg Monthly Revenue', value: formatCurrency(totalRevenue / 5), sub: 'Last 5 months', color: 'text-[#111827]' },
          { label: 'Overage Revenue', value: formatCurrency(totalOverages), sub: `${avgOveragePct}% of base billing`, color: 'text-[#d97706]' },
          { label: 'Service Revenue', value: formatCurrency(revenueData.reduce((s,d)=>s+d.service,0)), sub: 'Billable calls YTD', color: 'text-[#7c3aed]' },
        ].map(k => (
          <div key={k.label} className="bg-white border border-[#e5e7eb] rounded-lg p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="text-xs text-[#6b7280] uppercase tracking-wide font-medium mb-1.5">{k.label}</div>
            <div className={`text-xl font-semibold tabular-nums ${k.color}`}>{k.value}</div>
            <div className="text-xs text-[#9ca3af] mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Revenue trend */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <ChartCard title="Monthly Revenue" subtitle="Base + Overages + Service">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5c5fef" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#5c5fef" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="overageGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d97706" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#d97706" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(1)}k`} />
              <Tooltip {...TooltipStyle} formatter={(v) => formatCurrency(Number(v ?? 0))} />
              <Area type="monotone" dataKey="base" stroke="#5c5fef" fill="url(#baseGrad)" strokeWidth={2} name="Base" />
              <Area type="monotone" dataKey="overages" stroke="#d97706" fill="url(#overageGrad)" strokeWidth={2} name="Overages" />
              <Area type="monotone" dataKey="service" stroke="#7c3aed" fill="none" strokeWidth={1.5} strokeDasharray="4 2" name="Service" />
              <Legend wrapperStyle={{ fontSize: 11, color: '#6b7280', paddingTop: 8 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Service Call Volume" subtitle="Open vs closed per month">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={serviceData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip {...TooltipStyle} />
              <Bar dataKey="closed" fill="#16a34a" radius={[3, 3, 0, 0]} name="Closed" />
              <Bar dataKey="open" fill="#dc2626" radius={[3, 3, 0, 0]} name="Open" />
              <Legend wrapperStyle={{ fontSize: 11, color: '#6b7280', paddingTop: 8 }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <ChartCard title="Contract Types" subtitle="By count">
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={contractTypeData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {contractTypeData.filter(d => d.value > 0).map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...TooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#6b7280' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <div className="col-span-2"><ChartCard title="Print Volume Trend" subtitle="Monthly B&W and Color pages (thousands)">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={meterVolumeData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip {...TooltipStyle} formatter={(v) => Number(v ?? 0).toLocaleString()} />
              <Bar dataKey="bw" fill="#d1d5db" radius={[3, 3, 0, 0]} name="B&W" />
              <Bar dataKey="color" fill="#5c5fef" radius={[3, 3, 0, 0]} name="Color" />
              <Legend wrapperStyle={{ fontSize: 11, color: '#6b7280', paddingTop: 8 }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard></div>

        {/* Contract profitability table */}
        <div className="col-span-3 bg-white border border-[#e5e7eb] rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="px-4 py-3 border-b border-[#f3f4f6]">
            <div className="text-sm font-semibold text-[#111827]">Contract Profitability — May 2026</div>
            <div className="text-xs text-[#9ca3af] mt-0.5">Base rate + overages generated per contract</div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
              <tr>
                {['Customer', 'Contract #', 'Type', 'Base', 'B&W Overages', 'Color Overages', 'Total Billed', 'Est. Margin'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {[
                { customer: 'Meridian Law Group', contract: 'CON-2024-001', type: 'CPC', base: 185, bw: 71.12, color: 172.90, margin: 72 },
                { customer: 'Brightside Medical', contract: 'CON-2024-002', type: 'CPC', base: 320, bw: 27.43, color: 177.10, margin: 68 },
                { customer: 'Oakland USD', contract: 'CON-2024-003', type: 'Flat Rate', base: 450, bw: 0, color: 0, margin: 61 },
                { customer: 'Golden Gate Realty', contract: 'CON-2024-004', type: 'CPC', base: 95, bw: 0, color: 0, margin: 65 },
                { customer: 'Bay Area Accounting', contract: 'CON-2024-005', type: 'CPC', base: 275, bw: 65.80, color: 228, margin: 70 },
                { customer: 'Embarcadero Tech', contract: 'CON-2024-006', type: 'CPC', base: 210, bw: 7.65, color: 37.70, margin: 66 },
              ].map(row => {
                const total = row.base + row.bw + row.color
                return (
                  <tr key={row.contract} className="h-10 hover:bg-[#f9fafb] transition-colors">
                    <td className="px-4 py-2.5 text-[#111827] font-medium">{row.customer}</td>
                    <td className="px-4 py-2.5"><span className="font-mono text-xs text-[#5c5fef] font-medium">{row.contract}</span></td>
                    <td className="px-4 py-2.5"><span className="text-xs text-[#6b7280]">{row.type}</span></td>
                    <td className="px-4 py-2.5"><span className="tabular-nums text-xs">{formatCurrency(row.base)}</span></td>
                    <td className="px-4 py-2.5"><span className={`tabular-nums text-xs font-medium ${row.bw > 0 ? 'text-[#d97706]' : 'text-[#9ca3af]'}`}>{formatCurrency(row.bw)}</span></td>
                    <td className="px-4 py-2.5"><span className={`tabular-nums text-xs font-medium ${row.color > 0 ? 'text-[#d97706]' : 'text-[#9ca3af]'}`}>{formatCurrency(row.color)}</span></td>
                    <td className="px-4 py-2.5"><span className="font-semibold tabular-nums">{formatCurrency(total)}</span></td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 bg-[#f3f4f6] rounded-full overflow-hidden">
                          <div className="h-full bg-[#16a34a] rounded-full" style={{ width: `${row.margin}%` }} />
                        </div>
                        <span className={`text-xs font-semibold tabular-nums ${row.margin >= 65 ? 'text-[#16a34a]' : 'text-[#d97706]'}`}>{row.margin}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
