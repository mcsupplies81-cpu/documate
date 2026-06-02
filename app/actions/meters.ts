'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

interface MeterEntry {
  equipment_id: string
  bw_reading: number
  color_reading: number | null
  reading_date: string
  notes?: string
  source?: 'manual' | 'customer' | 'dca'
}

export async function saveMeterReadings(entries: MeterEntry[]) {
  if (!entries.length) return { error: 'No readings provided' }

  if (DEMO) {
    return { success: true, saved: entries.length, demo: true }
  }

  const supabase = await createClient()
  const rows = entries.map(e => ({
    equipment_id: e.equipment_id,
    bw_reading: e.bw_reading,
    color_reading: e.color_reading,
    reading_date: e.reading_date,
    notes: e.notes || null,
    source: e.source || 'manual',
  }))

  const { error } = await supabase.from('meter_readings').insert(rows)
  if (error) return { error: error.message }

  revalidatePath('/meters')
  revalidatePath('/dashboard')
  return { success: true, saved: entries.length }
}

export async function submitPublicMeters(token: string, readings: MeterEntry[], submitterNotes?: string) {
  if (DEMO) {
    return { success: true, demo: true }
  }

  const supabase = await createClient()

  // Validate token
  const { data: tokenRow, error: tokenErr } = await supabase
    .from('meter_tokens')
    .select('*')
    .eq('token', token)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (tokenErr || !tokenRow) {
    return { error: 'Invalid or expired submission link' }
  }

  // Insert readings using service role to bypass RLS for public submission
  const rows = readings.map(e => ({
    equipment_id: e.equipment_id,
    tenant_id: tokenRow.tenant_id,
    bw_reading: e.bw_reading,
    color_reading: e.color_reading,
    reading_date: e.reading_date,
    source: 'customer' as const,
    notes: submitterNotes || null,
  }))

  const { error: insertErr } = await supabase.from('meter_readings').insert(rows)
  if (insertErr) return { error: insertErr.message }

  // Mark token as used
  await supabase.from('meter_tokens').update({ used: true, used_at: new Date().toISOString() }).eq('id', tokenRow.id)

  return { success: true }
}
