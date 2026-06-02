import {
  Html, Head, Body, Container, Section, Row, Column,
  Text, Hr, Link, Preview, Tailwind
} from '@react-email/components'

interface ContractExpiryEmailProps {
  recipientName: string
  customerName: string
  contractNumber: string
  expiryDate: string
  daysUntilExpiry: number
  contractType: string
  monthlyRate: number
  renewalUrl?: string
  dealerName: string
  dealerPhone: string
  dealerEmail: string
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export default function ContractExpiryEmail({
  recipientName = 'Jordan Martinez',
  customerName = 'Golden Gate Realty',
  contractNumber = 'CON-2024-004',
  expiryDate = '2026-06-30',
  daysUntilExpiry = 29,
  contractType = 'CPC',
  monthlyRate = 95.00,
  renewalUrl,
  dealerName = 'Pacific Office Solutions',
  dealerPhone = '(415) 555-9000',
  dealerEmail = 'service@pacificoffice.com',
}: ContractExpiryEmailProps) {
  const urgent = daysUntilExpiry <= 14
  const urgencyColor = urgent ? '#ef4444' : '#f59e0b'
  const urgencyLabel = urgent ? 'URGENT — ' : ''

  return (
    <Html>
      <Head />
      <Preview>{urgencyLabel}Contract {contractNumber} for {customerName} expires in {daysUntilExpiry} days</Preview>
      <Tailwind>
        <Body className="bg-[#f4f4f5] font-sans m-0 p-0">
          <Container className="max-w-[600px] mx-auto my-8">
            {/* Header */}
            <Section className="bg-[#0a0a0a] rounded-t-lg px-8 py-6">
              <Text className="text-[#00d4ff] text-xl font-bold m-0 tracking-tight">{dealerName}</Text>
              <Text className="text-[#555] text-xs m-0 mt-1">Contract renewal alert</Text>
            </Section>

            {/* Urgency banner */}
            <Section style={{ backgroundColor: urgencyColor + '18', borderLeft: `4px solid ${urgencyColor}` }} className="px-6 py-3">
              <Text className="text-sm font-semibold m-0" style={{ color: urgencyColor }}>
                {urgent ? '⚠ ' : ''}Contract expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
              </Text>
            </Section>

            <Section className="bg-white px-8 py-6">
              <Text className="text-gray-700 text-sm m-0 mb-4">Hi {recipientName},</Text>
              <Text className="text-gray-700 text-sm m-0 mb-5">
                The following service contract is approaching its expiration date and requires your attention:
              </Text>

              {/* Contract details */}
              <Section className="bg-gray-50 rounded-lg px-5 py-4 mb-5">
                <Row>
                  <Column className="w-1/2">
                    <Text className="text-gray-400 text-xs uppercase tracking-wider m-0 mb-1">Customer</Text>
                    <Text className="text-gray-800 text-sm font-semibold m-0">{customerName}</Text>
                  </Column>
                  <Column className="w-1/2">
                    <Text className="text-gray-400 text-xs uppercase tracking-wider m-0 mb-1">Contract #</Text>
                    <Text className="text-[#0ea5e9] text-sm font-mono m-0">{contractNumber}</Text>
                  </Column>
                </Row>
                <Hr className="border-gray-200 my-3" />
                <Row>
                  <Column className="w-1/2">
                    <Text className="text-gray-400 text-xs uppercase tracking-wider m-0 mb-1">Contract Type</Text>
                    <Text className="text-gray-800 text-sm m-0">{contractType}</Text>
                  </Column>
                  <Column className="w-1/2">
                    <Text className="text-gray-400 text-xs uppercase tracking-wider m-0 mb-1">Monthly Rate</Text>
                    <Text className="text-gray-800 text-sm font-mono m-0">{fmt(monthlyRate)}/mo</Text>
                  </Column>
                </Row>
                <Hr className="border-gray-200 my-3" />
                <Row>
                  <Column>
                    <Text className="text-gray-400 text-xs uppercase tracking-wider m-0 mb-1">Expiry Date</Text>
                    <Text className="text-sm font-semibold m-0" style={{ color: urgencyColor }}>{expiryDate}</Text>
                  </Column>
                </Row>
              </Section>

              <Text className="text-gray-700 text-sm m-0 mb-5">
                Please reach out to the customer to discuss renewal terms. If this contract is not renewed,
                equipment will lose service coverage and overage billing will stop.
              </Text>

              {renewalUrl && (
                <Section className="mb-5">
                  <Link
                    href={renewalUrl}
                    className="bg-[#0ea5e9] text-white text-sm font-medium px-5 py-3 rounded-lg no-underline inline-block"
                  >
                    View Contract &amp; Renew →
                  </Link>
                </Section>
              )}

              <Hr className="border-gray-200 my-5" />

              <Text className="text-gray-400 text-xs m-0">
                This is an automated alert from DealerOS. You are receiving this because you manage
                this account at {dealerName}. <br />
                Questions? {dealerPhone} · {dealerEmail}
              </Text>
            </Section>

            <Section className="bg-gray-100 rounded-b-lg px-8 py-4">
              <Text className="text-gray-400 text-[11px] text-center m-0">
                {dealerName} · San Francisco, CA
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
