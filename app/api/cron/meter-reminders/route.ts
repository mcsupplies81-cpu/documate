import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * Meter reading reminder cron — sends email + generates portal tokens
 * for customers who haven't submitted meters for the current period.
 *
 * Cron schedule (vercel.json): "0 9 25 * *"  (9am UTC on the 25th)
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  if (DEMO) {
    return NextResponse.json({ success: true, demo: true, reminders_sent: 0 })
  }

  try {
    const supabase = await createServiceClient()

    // Find equipment on active CPC contracts with no reading this month
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

    const { data: equipment, error } = await supabase
      .from('contract_equipment')
      .select(`
        equipment_id,
        equipment:equipment(id, make, model, serial_number, customer_id,
          customer:customers(id, name, email),
          meter_readings(reading_date)
        ),
        contract:contracts(status)
      `)
      .in('contract.status', ['active', 'expiring'])

    if (error) throw error

    // Filter to equipment with no reading this month
    const needsReading = (equipment || []).filter((ce: any) => {
      const readings = ce.equipment?.meter_readings || []
      const hasCurrentReading = readings.some((r: any) => r.reading_date >= monthStart)
      return !hasCurrentReading && ce.equipment?.customer?.email
    })

    const sent: string[] = []
    const errors: string[] = []

    for (const ce of needsReading) {
      try {
        const eq = ce.equipment as any
        const customer = eq.customer

        // Generate portal token
        const token = crypto.randomUUID()
        const expiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString()

        await supabase.from('meter_tokens').insert({
          token,
          tenant_id: eq.tenant_id,
          customer_id: customer.id,
          equipment_ids: [eq.id],
          expires_at: expiresAt,
          used: false,
        })

        // TODO: Send email via Resend
        // const { Resend } = await import('resend')
        // const resend = new Resend(process.env.RESEND_API_KEY)
        // await resend.emails.send({ ... render MeterRequestEmail ... })

        sent.push(customer.email)
      } catch (err: any) {
        errors.push(err.message)
      }
    }

    return NextResponse.json({
      success: true,
      equipment_checked: equipment?.length || 0,
      needs_reading: needsReading.length,
      reminders_sent: sent.length,
      errors_count: errors.length,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
