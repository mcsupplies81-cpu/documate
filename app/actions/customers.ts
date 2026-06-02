'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export async function createCustomer(formData: FormData) {
  const payload = {
    name: formData.get('name') as string,
    email: formData.get('email') as string || null,
    phone: formData.get('phone') as string || null,
    notes: formData.get('notes') as string || null,
    billing_address: {
      street: formData.get('street') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zip: formData.get('zip') as string,
    },
  }

  if (!payload.name?.trim()) {
    return { error: 'Customer name is required' }
  }

  if (DEMO) {
    // In demo mode we can't persist — just simulate success
    return { success: true, id: `demo-${Date.now()}`, demo: true }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .insert(payload)
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/customers')
  return { success: true, id: data.id }
}

export async function updateCustomer(id: string, formData: FormData) {
  const payload = {
    name: formData.get('name') as string,
    email: formData.get('email') as string || null,
    phone: formData.get('phone') as string || null,
    notes: formData.get('notes') as string || null,
    billing_address: {
      street: formData.get('street') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zip: formData.get('zip') as string,
    },
  }

  if (DEMO) return { success: true, demo: true }

  const supabase = await createClient()
  const { error } = await supabase
    .from('customers')
    .update(payload)
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/customers')
  revalidatePath(`/customers/${id}`)
  return { success: true }
}
