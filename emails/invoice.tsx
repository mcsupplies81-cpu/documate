import {
  Html, Head, Body, Container, Section, Row, Column,
  Text, Hr, Link, Preview, Tailwind, Font
} from '@react-email/components'

interface LineItem {
  description: string
  quantity: number
  unit_price: number
  total: number
}

interface InvoiceEmailProps {
  invoiceNumber: string
  customerName: string
  dealerName: string
  dealerEmail: string
  dealerPhone: string
  billingPeriodStart: string
  billingPeriodEnd: string
  dueDate: string
  total: number
  subtotal: number
  lineItems: LineItem[]
  paymentPortalUrl?: string
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export default function InvoiceEmail({
  invoiceNumber = 'INV-2026-0051',
  customerName = 'Meridian Law Group',
  dealerName = 'Pacific Office Solutions',
  dealerEmail = 'billing@pacificoffice.com',
  dealerPhone = '(415) 555-9000',
  billingPeriodStart = '2026-05-01',
  billingPeriodEnd = '2026-05-31',
  dueDate = '2026-06-15',
  total = 271.68,
  subtotal = 271.68,
  lineItems = [
    { description: 'Base Service — May 2026', quantity: 1, unit_price: 185.00, total: 185.00 },
    { description: 'B&W Overage — bizhub C360i (5,050 pages)', quantity: 5050, unit_price: 0.008, total: 40.40 },
    { description: 'Color Overage — bizhub C360i (2,320 pages)', quantity: 2320, unit_price: 0.065, total: 46.28 },
  ],
  paymentPortalUrl,
}: InvoiceEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Invoice {invoiceNumber} from {dealerName} — {fmt(total)} due {dueDate}</Preview>
      <Tailwind>
        <Body className="bg-[#f4f4f5] font-sans m-0 p-0">
          <Container className="max-w-[600px] mx-auto my-8">
            {/* Header */}
            <Section className="bg-[#0a0a0a] rounded-t-lg px-8 py-6">
              <Text className="text-[#00d4ff] text-xl font-bold m-0 tracking-tight">{dealerName}</Text>
              <Text className="text-[#555] text-xs m-0 mt-1">{dealerEmail} · {dealerPhone}</Text>
            </Section>

            {/* Body */}
            <Section className="bg-white px-8 py-6">
              <Text className="text-gray-800 text-base font-semibold m-0">Invoice {invoiceNumber}</Text>
              <Text className="text-gray-500 text-sm m-0 mt-1">
                Billing period: {billingPeriodStart} – {billingPeriodEnd}
              </Text>

              <Hr className="border-gray-200 my-5" />

              <Text className="text-gray-700 text-sm m-0 mb-4">Dear {customerName},</Text>
              <Text className="text-gray-700 text-sm m-0 mb-4">
                Please find your invoice for the above billing period. A summary of charges is included below.
              </Text>

              {/* Line items */}
              <Section className="bg-gray-50 rounded-lg px-5 py-4 mb-5">
                {lineItems.map((item, i) => (
                  <Row key={i} className={i > 0 ? 'border-t border-gray-200' : ''}>
                    <Column className="py-2.5">
                      <Text className="text-gray-800 text-sm m-0">{item.description}</Text>
                      {item.quantity > 1 && (
                        <Text className="text-gray-400 text-xs m-0">{item.quantity.toLocaleString()} × ${item.unit_price.toFixed(4)}</Text>
                      )}
                    </Column>
                    <Column className="py-2.5 text-right w-24">
                      <Text className="text-gray-800 text-sm font-mono m-0">{fmt(item.total)}</Text>
                    </Column>
                  </Row>
                ))}
                <Hr className="border-gray-300 my-2" />
                <Row>
                  <Column>
                    <Text className="text-gray-900 text-base font-semibold m-0">Total Due</Text>
                  </Column>
                  <Column className="text-right w-24">
                    <Text className="text-[#0ea5e9] text-base font-bold font-mono m-0">{fmt(total)}</Text>
                  </Column>
                </Row>
              </Section>

              <Text className="text-gray-500 text-sm m-0">
                <strong className="text-gray-700">Due date:</strong> {dueDate}
              </Text>

              {paymentPortalUrl && (
                <Section className="mt-5">
                  <Link
                    href={paymentPortalUrl}
                    className="bg-[#0ea5e9] text-white text-sm font-medium px-5 py-3 rounded-lg no-underline inline-block"
                  >
                    View & Pay Invoice →
                  </Link>
                </Section>
              )}

              <Hr className="border-gray-200 my-5" />

              <Text className="text-gray-400 text-xs m-0">
                Questions? Reply to this email or call {dealerPhone}. <br />
                Please include invoice number <strong>{invoiceNumber}</strong> on all correspondence.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="bg-gray-100 rounded-b-lg px-8 py-4">
              <Text className="text-gray-400 text-[11px] text-center m-0">
                {dealerName} · San Francisco, CA · {dealerEmail}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
