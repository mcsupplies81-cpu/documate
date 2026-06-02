'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { InvoiceStatus } from '@/lib/types'

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export async function markInvoicePaid(id: string) {
  if (DEMO) return { success: true, demo: true }

  const supabase = await createClient()
  const { error } = await supabase
    .from('invoices')
    .update({ status: 'paid' as InvoiceStatus, paid_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/invoices')
  revalidatePath(`/invoices/${id}`)
  return { success: true }
}

export async function sendInvoiceEmail(id: string) {
  if (DEMO) return { success: true, demo: true, message: 'Email queued (demo mode)' }

  const supabase = await createClient()
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*, customer:customers(name, email)')
    .eq('id', id)
    .single()

  if (error || !invoice) return { error: 'Invoice not found' }
  if (!invoice.customer?.email) return { error: 'Customer has no email address' }

  // In production: call Resend API here
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({ from: ..., to: invoice.customer.email, ... })

  await supabase.from('invoices').update({ status: 'sent' as InvoiceStatus }).eq('id', id)

  revalidatePath('/invoices')
  return { success: true, sent_to: invoice.customer.email }
}

export async function runBillingCycle(contractIds: string[], periodStart: string, periodEnd: string) {
  if (DEMO) {
    // Simulate billing run with fake delay handled on the client
    return { success: true, invoices_created: contractIds.length, demo: true }
  }

  const supabase = await createClient()
  const results: { contract_id: string; invoice_id?: string; error?: string }[] = []

  for (const contractId of contractIds) {
    const { data: invoice, error } = await supabase
      .rpc('generate_invoice', {
        p_contract_id: contractId,
        p_period_start: periodStart,
        p_period_end: periodEnd,
      })
      .single()

    results.push(error
      ? { contract_id: contractId, error: error.message }
      : { contract_id: contractId, invoice_id: (invoice as { id?: string } | null)?.id }
    )
  }

  revalidatePath('/invoices')
  const failed = results.filter(r => r.error).length
  return { success: true, results, failed }
}
