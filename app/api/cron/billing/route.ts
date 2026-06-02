import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * Monthly billing cron — called by Vercel Cron or external scheduler
 * on the 1st of each month.
 *
 * Cron schedule (vercel.json): "0 6 1 * *"  (6am UTC on the 1st)
 *
 * Authorization: Bearer token set in CRON_SECRET env var.
 * Vercel automatically passes this header when using cron jobs.
 */
export async function POST(req: NextRequest) {
  // Auth check
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  if (DEMO) {
    return NextResponse.json({
      success: true,
      demo: true,
      message: 'Demo mode — no invoices generated',
    })
  }

  try {
    const supabase = await createServiceClient()

    // Get all active contracts that need billing this month
    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
    const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]

    const { data: contracts, error: contractsErr } = await supabase
      .from('contracts')
      .select('id, contract_number, customer_id, base_rate, billing_cycle')
      .in('status', ['active', 'expiring'])
      .eq('billing_cycle', 'monthly')

    if (contractsErr) throw contractsErr

    const results: { contract_id: string; status: 'ok' | 'error'; invoice_id?: string; error?: string }[] = []

    for (const contract of (contracts || [])) {
      try {
        // Check if invoice already exists for this period
        const { data: existing } = await supabase
          .from('invoices')
          .select('id')
          .eq('contract_id', contract.id)
          .eq('billing_period_start', periodStart)
          .single()

        if (existing) {
          results.push({ contract_id: contract.id, status: 'ok', invoice_id: existing.id })
          continue
        }

        // Generate invoice via DB function
        const { data: invoice, error: invErr } = await supabase
          .rpc('generate_invoice', {
            p_contract_id: contract.id,
            p_period_start: periodStart,
            p_period_end: periodEnd,
          })
          .single()

        if (invErr) throw invErr
        results.push({ contract_id: contract.id, status: 'ok', invoice_id: (invoice as any)?.id })
      } catch (err: any) {
        results.push({ contract_id: contract.id, status: 'error', error: err.message })
      }
    }

    const failed = results.filter(r => r.status === 'error').length
    const created = results.filter(r => r.status === 'ok').length

    return NextResponse.json({
      success: true,
      period: `${periodStart} to ${periodEnd}`,
      contracts_processed: contracts?.length || 0,
      invoices_created: created,
      failed,
      results,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
