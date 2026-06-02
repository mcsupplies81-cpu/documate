import {
  Html, Head, Body, Container, Section, Row, Column,
  Text, Hr, Link, Preview, Tailwind, Button
} from '@react-email/components'

interface MeterEquipment {
  make: string
  model: string
  serial: string
  location?: string
  lastBwReading: number
  lastReadingDate: string
}

interface MeterRequestEmailProps {
  customerName: string
  contactName: string
  dealerName: string
  dealerPhone: string
  dueDate: string
  period: string
  equipment: MeterEquipment[]
  submissionUrl: string
}

export default function MeterRequestEmail({
  customerName = 'Meridian Law Group',
  contactName = 'Lisa Chen',
  dealerName = 'Pacific Office Solutions',
  dealerPhone = '(415) 555-9000',
  dueDate = '2026-06-07',
  period = 'May 2026',
  equipment = [
    { make: 'Konica Minolta', model: 'bizhub C360i', serial: 'A1234567', location: 'Main Office', lastBwReading: 138180, lastReadingDate: '2026-04-30' },
    { make: 'Kyocera', model: 'ECOSYS M8130cidn', serial: 'B2345678', location: 'Floor 3', lastBwReading: 84200, lastReadingDate: '2026-04-30' },
  ],
  submissionUrl = 'https://app.pacificoffice.com/meters/submit/TOKEN',
}: MeterRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Action needed: Submit meter readings for {period} — due {dueDate}</Preview>
      <Tailwind>
        <Body className="bg-[#f4f4f5] font-sans m-0 p-0">
          <Container className="max-w-[600px] mx-auto my-8">
            {/* Header */}
            <Section className="bg-[#0a0a0a] rounded-t-lg px-8 py-6">
              <Text className="text-[#00d4ff] text-xl font-bold m-0 tracking-tight">{dealerName}</Text>
              <Text className="text-[#555] text-xs m-0 mt-1">Monthly meter reading request</Text>
            </Section>

            <Section className="bg-white px-8 py-6">
              <Text className="text-gray-800 text-base font-semibold m-0">Meter Reading Request — {period}</Text>

              <Hr className="border-gray-200 my-5" />

              <Text className="text-gray-700 text-sm m-0 mb-3">Hi {contactName},</Text>
              <Text className="text-gray-700 text-sm m-0 mb-5">
                It&apos;s time to submit meter readings for your {equipment.length === 1 ? 'machine' : `${equipment.length} machines`} for the <strong>{period}</strong> billing period.
                Please submit by <strong>{dueDate}</strong> to ensure accurate billing.
              </Text>

              {/* Equipment list */}
              <Section className="bg-gray-50 rounded-lg px-5 py-4 mb-5">
                <Text className="text-gray-500 text-xs uppercase tracking-wider m-0 mb-3">Equipment to Read</Text>
                {equipment.map((e, i) => (
                  <Row key={i} className={i > 0 ? 'border-t border-gray-200 pt-3 mt-3' : ''}>
                    <Column>
                      <Text className="text-gray-800 text-sm font-medium m-0">{e.make} {e.model}</Text>
                      <Text className="text-gray-400 text-xs m-0">S/N {e.serial}{e.location ? ` · ${e.location}` : ''}</Text>
                      <Text className="text-gray-400 text-xs m-0">
                        Last reading: {e.lastBwReading.toLocaleString()} (as of {e.lastReadingDate})
                      </Text>
                    </Column>
                  </Row>
                ))}
              </Section>

              <Text className="text-gray-600 text-sm m-0 mb-5">
                Click the button below to submit your readings. The form will guide you through each machine.
              </Text>

              <Section className="mb-5">
                <Link
                  href={submissionUrl}
                  className="bg-[#0ea5e9] text-white text-sm font-medium px-6 py-3 rounded-lg no-underline inline-block"
                >
                  Submit Meter Readings →
                </Link>
              </Section>

              <Text className="text-gray-400 text-xs m-0 mb-1">
                Or copy this link into your browser:
              </Text>
              <Text className="text-[#0ea5e9] text-xs m-0 break-all">{submissionUrl}</Text>

              <Hr className="border-gray-200 my-5" />

              <Text className="text-gray-700 text-sm m-0 mb-1">
                <strong>How to find your meter reading:</strong>
              </Text>
              <Text className="text-gray-500 text-xs m-0 leading-relaxed">
                On most machines: press the &ldquo;Counter&rdquo; or &ldquo;User Tools&rdquo; button on the control panel,
                then navigate to &ldquo;Counter&rdquo; or &ldquo;Print Count.&rdquo; The number shown is the total pages printed
                since installation — not a monthly count.
              </Text>

              <Hr className="border-gray-200 my-5" />

              <Text className="text-gray-400 text-xs m-0">
                Questions? Call {dealerPhone} and we&apos;ll help you locate the counter. <br />
                This request is for {customerName}.
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
