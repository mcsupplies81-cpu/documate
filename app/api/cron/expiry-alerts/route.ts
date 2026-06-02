import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * Contract expiry alert cron — emails internal team about expiring contracts.
 *
 * Cron schedule (vercel.json): "0 8 * * 1"  (8am UTC every Monday)
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  if (DEMO) {
    return NextResponse.json({ success: true, demo: true })
  }

  try {
    const supabase = await createServiceClient()
    const now = new Date()

    // Get contracts expiring in the next 60 days
    const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const today = now.toISOString().split('T')[0]

    const { data: expiring, error } = await supabase
      .from('contracts')
      .select('id, contract_number, end_date, auto_renew, base_rate, customer:customers(name, email)')
      .in('status', ['active', 'expiring'])
      .gte('end_date', today)
      .lte('end_date', in60Days)
      .order('end_date', { ascending: true })

    if (error) throw error

    const alerts = (expiring || []).map((c: any) => {
      const daysLeft = Math.floor((new Date(c.end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return { ...c, days_until_expiry: daysLeft }
    })

    // TODO: Send email via Resend
    // Group by urgency: <= 14 days (critical), 15-30 (warning), 31-60 (info)
    const critical = alerts.filter((a: any) => a.days_until_expiry <= 14)
    const warning = alerts.filter((a: any) => a.days_until_expiry > 14 && a.days_until_expiry <= 30)
    const upcoming = alerts.filter((a: any) => a.days_until_expiry > 30)

    // Mark contracts as 'expiring' status in DB
    if (alerts.length > 0) {
      const ids = alerts
        .filter((a: any) => a.days_until_expiry <= 30)
        .map((a: any) => a.id)
      if (ids.length > 0) {
        await supabase.from('contracts').update({ status: 'expiring' }).in('id', ids)
      }
    }

    return NextResponse.json({
      success: true,
      contracts_checked: expiring?.length || 0,
      critical: critical.length,
      warning: warning.length,
      upcoming: upcoming.length,
      alerts,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
