import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export async function POST(req: NextRequest) {
  if (DEMO) {
    return NextResponse.json({ success: true, demo: true })
  }

  try {
    const body = await req.json()
    const { token, readings, notes } = body as {
      token: string
      readings: Array<{ equipment_id: string; bw_reading: number; color_reading?: number }>
      notes?: string
    }

    if (!token || !readings?.length) {
      return NextResponse.json({ error: 'Missing token or readings' }, { status: 400 })
    }

    // Use service client to bypass RLS for public submission
    const supabase = await createServiceClient()

    // Validate token
    const { data: tokenRow, error: tokenErr } = await supabase
      .from('meter_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (tokenErr || !tokenRow) {
      return NextResponse.json({ error: 'Invalid or expired submission link' }, { status: 403 })
    }

    const today = new Date().toISOString().split('T')[0]

    const rows = readings.map(r => ({
      equipment_id: r.equipment_id,
      tenant_id: tokenRow.tenant_id,
      bw_reading: r.bw_reading,
      color_reading: r.color_reading ?? null,
      reading_date: today,
      source: 'customer',
      notes: notes || null,
    }))

    const { error: insertErr } = await supabase.from('meter_readings').insert(rows)
    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    // Mark token used
    await supabase
      .from('meter_tokens')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('id', tokenRow.id)

    return NextResponse.json({ success: true, saved: readings.length })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
