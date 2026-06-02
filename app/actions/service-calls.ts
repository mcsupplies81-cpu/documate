'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ServiceCallStatus, ServiceCallPriority } from '@/lib/types'

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export async function createServiceCall(formData: FormData) {
  const payload = {
    customer_id: formData.get('customer_id') as string,
    equipment_id: formData.get('equipment_id') as string || null,
    priority: (formData.get('priority') as ServiceCallPriority) || 'normal',
    problem_description: formData.get('problem_description') as string,
    technician_id: formData.get('technician_id') as string || null,
    scheduled_date: formData.get('scheduled_date') as string || null,
  }

  if (!payload.customer_id || !payload.problem_description?.trim()) {
    return { error: 'Customer and problem description are required' }
  }

  if (DEMO) return { success: true, id: `sc-demo-${Date.now()}`, demo: true }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('service_calls')
    .insert(payload)
    .select('id, call_number')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/service')
  return { success: true, id: data.id, call_number: data.call_number }
}

export async function updateServiceCallStatus(id: string, status: ServiceCallStatus, resolutionNotes?: string) {
  if (DEMO) return { success: true, demo: true }

  const supabase = await createClient()
  const updates: Record<string, unknown> = { status }
  if (status === 'closed' || status === 'completed') {
    updates.closed_at = new Date().toISOString()
    if (resolutionNotes) updates.resolution_notes = resolutionNotes
  }

  const { error } = await supabase.from('service_calls').update(updates).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/service')
  revalidatePath(`/service/${id}`)
  return { success: true }
}

export async function assignTechnician(id: string, technicianId: string) {
  if (DEMO) return { success: true, demo: true }

  const supabase = await createClient()
  const { error } = await supabase
    .from('service_calls')
    .update({ technician_id: technicianId, status: 'assigned' })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/service')
  revalidatePath(`/service/${id}`)
  return { success: true }
}
