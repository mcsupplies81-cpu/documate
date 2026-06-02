'use client'
import { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, AlertTriangle, CheckCircle } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Table, Thead, Th, Tbody, Tr, Td, EmptyRow } from '@/components/ui/table'
import { Modal } from '@/components/ui/modal'
import { MOCK_EQUIPMENT, MOCK_METER_READINGS, MOCK_SERVICE_CALLS, MOCK_CONTRACT_EQUIPMENT, MOCK_CONTRACTS } from '@/lib/mock-data'
import { formatNumber } from '@/lib/billing'

export default function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [meterOpen, setMeterOpen] = useState(false)
  const [bwVal, setBwVal] = useState('')
  const [colorVal, setColorVal] = useState('')
  const [source, setSource] = useState('manual')
  const [saved, setSaved] = useState(false)

  const eq = MOCK_EQUIPMENT.find(e => e.id === id)
  if (!eq) return (
    <div className="text-[#555] py-20 text-center">
      Equipment not found. <Link href="/equipment" className="text-[#00d4ff]">Back to list</Link>
    </div>
  )

  const readings = MOCK_METER_READINGS
    .filter(r => r.equipment_id === id)
    .sort((a, b) => new Date(b.reading_date).getTime() - new Date(a.reading_date).getTime())

  const latestReading = readings[0]
  const prevReading = readings[1]
  const serviceCalls = MOCK_SERVICE_CALLS.filter(sc => sc.equipment_id === id)
  const contractEq = MOCK_CONTRACT_EQUIPMENT.find(ce => ce.equipment_id === id)
  const contract = contractEq ? MOCK_CONTRACTS.find(c => c.id === contractEq.contract_id) : null

  const bwDelta = latestReading && prevReading
    ? latestReading.bw_reading - prevReading.bw_reading : null
  const colorDelta = latestReading && prevReading
    ? latestReading.color_reading - prevReading.color_reading : null

  const handleSaveMeter = () => {
    setSaved(true)
    setTimeout(() => { setSaved(false); setMeterOpen(false) }, 1000)
  }

  const validateReading = (val: string, last: number) => {
    const n = parseInt(val)
    if (isNaN(n)) return null
    if (n < last) return 'error'
    if (n > last * 2 + 10000) return 'suspect'
    return 'ok'
  }

  const bwStatus = bwVal ? validateReading(bwVal, latestReading?.bw_reading ?? 0) : null
  const colorStatus = colorVal ? validateReading(colorVal, latestReading?.color_reading ?? 0) : null

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Link href="/equipment" className="text-[#555] hover:text-[#888]"><ArrowLeft className="w-4 h-4" /></Link>
        <span className="text-[#333]">/</span>
        <Link href="/equipment" className="text-sm text-[#555]">Equipment</Link>
        <span className="text-[#333]">/</span>
        <span className="text-sm text-[#888]">{eq.make} {eq.model}</span>
      </div>

      <PageHeader
        title={`${eq.make} ${eq.model}`}
        actions={
          <>
            <Button variant="primary" size="sm" onClick={() => setMeterOpen(true)}>
              <Plus className="w-3.5 h-3.5" />
              Enter Meter Reading
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-[#555] font-mono">S/N: {eq.serial_number}</span>
          <span className="text-[#333]">·</span>
          <Link href={`/customers/${eq.customer_id}`} className="text-xs text-[#00d4ff] hover:underline">{eq.customer?.name}</Link>
          {eq.install_date && <><span className="text-[#333]">·</span><span className="text-xs text-[#555]">Installed {eq.install_date}</span></>}
          <Badge variant={eq.status === 'active' ? 'success' : eq.status === 'inactive' ? 'warning' : 'muted'}>{eq.status}</Badge>
        </div>
      </PageHeader>

      {/* Meter summary */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-3">
          <div className="text-xs text-[#555] uppercase tracking-wide mb-1">Current B&W</div>
          <div className="text-2xl font-mono font-semibold text-[#e8e8e8]">
            {latestReading ? formatNumber(latestReading.bw_reading) : '—'}
          </div>
          {bwDelta !== null && <div className="text-xs text-[#555] mt-0.5">+{formatNumber(bwDelta)} this period</div>}
        </div>
        <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-3">
          <div className="text-xs text-[#555] uppercase tracking-wide mb-1">Current Color</div>
          <div className="text-2xl font-mono font-semibold text-[#e8e8e8]">
            {latestReading ? formatNumber(latestReading.color_reading) : '—'}
          </div>
          {colorDelta !== null && <div className="text-xs text-[#555] mt-0.5">+{formatNumber(colorDelta)} this period</div>}
        </div>
        <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-3">
          <div className="text-xs text-[#555] uppercase tracking-wide mb-1">Last Reading</div>
          <div className="text-lg font-mono font-semibold text-[#888]">
            {latestReading?.reading_date || '—'}
          </div>
          <div className="text-xs text-[#444]">{latestReading?.source || ''}</div>
        </div>
        <div className="bg-[#111] border border-[#1e1e1e] rounded-lg p-3">
          <div className="text-xs text-[#555] uppercase tracking-wide mb-1">Contract</div>
          {contract
            ? <Link href={`/contracts/${contract.id}`} className="text-sm text-[#00d4ff] hover:underline font-mono">{contract.contract_number}</Link>
            : <div className="text-sm text-[#444]">None</div>
          }
          {contractEq && <div className="text-xs text-[#555] mt-0.5">{contractEq.included_bw.toLocaleString()} B&W / {contractEq.included_color.toLocaleString()} Color incl.</div>}
        </div>
      </div>

      {/* Notes */}
      {eq.notes && (
        <div className="bg-[#111] border border-[#f59e0b33] rounded-lg px-4 py-2.5 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b] flex-shrink-0" />
          <span className="text-sm text-[#888]">{eq.notes}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Meter History */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e1e]">
            <span className="text-sm font-medium">Meter History</span>
            <Button variant="ghost" size="sm" onClick={() => setMeterOpen(true)}>
              <Plus className="w-3 h-3" />Enter Reading
            </Button>
          </div>
          <Table>
            <Thead>
              <tr>
                <Th>Date</Th>
                <Th>B&W</Th>
                <Th>Color</Th>
                <Th>Source</Th>
                <Th></Th>
              </tr>
            </Thead>
            <Tbody>
              {readings.length === 0 && <EmptyRow cols={5} message="No readings recorded" />}
              {readings.map((r, i) => {
                const prev = readings[i + 1]
                const bwDiff = prev ? r.bw_reading - prev.bw_reading : null
                return (
                  <Tr key={r.id}>
                    <Td><span className="text-xs font-mono">{r.reading_date}</span></Td>
                    <Td>
                      <div className="font-mono text-xs text-[#e8e8e8]">{formatNumber(r.bw_reading)}</div>
                      {bwDiff !== null && <div className="text-[10px] text-[#555]">+{formatNumber(bwDiff)}</div>}
                    </Td>
                    <Td>
                      <span className="font-mono text-xs text-[#888]">{formatNumber(r.color_reading)}</span>
                    </Td>
                    <Td>
                      <Badge variant={r.source === 'dca' ? 'info' : r.source === 'customer' ? 'purple' : 'muted'}>
                        {r.source}
                      </Badge>
                    </Td>
                    <Td>
                      {r.is_suspect && <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b]" />}
                    </Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        </div>

        {/* Service History */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e1e]">
            <span className="text-sm font-medium">Service History</span>
            <Link href={`/service/new?equipment=${id}`}>
              <Button variant="ghost" size="sm"><Plus className="w-3 h-3" />New Call</Button>
            </Link>
          </div>
          <Table>
            <Thead>
              <tr>
                <Th>Call #</Th>
                <Th>Problem</Th>
                <Th>Tech</Th>
                <Th>Status</Th>
              </tr>
            </Thead>
            <Tbody>
              {serviceCalls.length === 0 && <EmptyRow cols={4} message="No service history" />}
              {serviceCalls.map(sc => (
                <Tr key={sc.id} onClick={() => window.location.href = `/service/${sc.id}`}>
                  <Td><span className="font-mono text-xs text-[#00d4ff]">{sc.call_number}</span></Td>
                  <Td><span className="text-xs text-[#888] block truncate max-w-[160px]">{sc.problem_description}</span></Td>
                  <Td><span className="text-xs">{sc.technician?.name || <span className="text-[#333]">—</span>}</span></Td>
                  <Td>
                    <Badge variant={sc.status === 'open' ? 'danger' : sc.status === 'in_progress' ? 'warning' : sc.status === 'completed' ? 'success' : 'muted'}>
                      {sc.status.replace('_', ' ')}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
      </div>

      {/* Meter Entry Modal */}
      <Modal open={meterOpen} onClose={() => setMeterOpen(false)} title="Enter Meter Reading">
        <div className="space-y-4">
          <div className="bg-[#0d0d0d] rounded-md px-3 py-2 text-xs text-[#555]">
            <div className="font-medium text-[#888] mb-1">{eq.make} {eq.model}</div>
            <div>S/N: <span className="font-mono">{eq.serial_number}</span></div>
            {latestReading && (
              <div className="mt-1">Last reading: <span className="font-mono">B&W {formatNumber(latestReading.bw_reading)} · Color {formatNumber(latestReading.color_reading)}</span> <span className="text-[#444]">({latestReading.reading_date})</span></div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="B&W Reading"
                type="number"
                placeholder={latestReading ? String(latestReading.bw_reading) : '0'}
                value={bwVal}
                onChange={e => setBwVal(e.target.value)}
              />
              {bwStatus === 'error' && <p className="text-xs text-[#ef4444] mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Lower than last reading</p>}
              {bwStatus === 'suspect' && <p className="text-xs text-[#f59e0b] mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Unusually high — verify</p>}
              {bwStatus === 'ok' && <p className="text-xs text-[#22c55e] mt-1 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Looks good</p>}
            </div>
            <div>
              <Input
                label="Color Reading"
                type="number"
                placeholder={latestReading ? String(latestReading.color_reading) : '0'}
                value={colorVal}
                onChange={e => setColorVal(e.target.value)}
              />
              {colorStatus === 'error' && <p className="text-xs text-[#ef4444] mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Lower than last reading</p>}
              {colorStatus === 'suspect' && <p className="text-xs text-[#f59e0b] mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Unusually high — verify</p>}
            </div>
          </div>

          <Select
            label="Reading Source"
            value={source}
            onChange={e => setSource(e.target.value)}
            options={[
              { value: 'manual', label: 'Manual Entry' },
              { value: 'customer', label: 'Customer Submitted' },
              { value: 'dca', label: 'DCA / Automated' },
            ]}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setMeterOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveMeter}
              disabled={!bwVal || bwStatus === 'error'}
              loading={saved}
            >
              {saved ? 'Saved!' : 'Save Reading'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
