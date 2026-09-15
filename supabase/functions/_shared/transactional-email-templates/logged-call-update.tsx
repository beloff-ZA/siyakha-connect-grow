import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'

interface Props {
  contactName?: string
  callRef?: string
  sitNumber?: string
  loggingCustomer?: string
  endCustomer?: string
  site?: string
  status?: string
  engineer?: string
  event?: string
  detail?: string
  scheduledAt?: string
}

const headingFor = (event?: string, status?: string) => {
  if (event === 'created') return 'Your call has been logged'
  return `Call update: ${status || 'In progress'}`
}

const Email = (p: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`Siyakha call ${p.callRef ?? ''} — ${p.status ?? 'update'}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>Siyakha Technology Solutions</Text>
        <Heading style={h1}>{headingFor(p.event, p.status)}</Heading>
        <Text style={text}>{p.contactName ? `Hi ${p.contactName}` : 'Hi there'},</Text>
        <Text style={text}>
          {p.event === 'created'
            ? 'Thank you — your support call has been logged with Siyakha and our team is on it.'
            : `There is an update on the call you logged with us. The current status is: ${p.status ?? 'updated'}.`}
        </Text>
        <Section style={box}>
          <Text style={row}><strong>Call reference:</strong> {p.callRef ?? '—'}{p.sitNumber ? ` (SIT ${p.sitNumber})` : ''}</Text>
          {p.loggingCustomer ? <Text style={row}><strong>Logged by:</strong> {p.loggingCustomer}</Text> : null}
          <Text style={row}><strong>End customer:</strong> {p.endCustomer ?? '—'}</Text>
          {p.site ? <Text style={row}><strong>Site:</strong> {p.site}</Text> : null}
          <Text style={row}><strong>Status:</strong> {p.status ?? '—'}</Text>
          {p.engineer ? <Text style={row}><strong>Engineer:</strong> {p.engineer}</Text> : null}
          {p.detail ? <Text style={row}><strong>Note:</strong> {p.detail}</Text> : null}
        </Section>
        <Text style={text}>
          Once the work is complete and signed off, you will receive the completed job card automatically.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>Siyakha Technology Solutions · 087 723 9183</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Siyakha support call update',
  displayName: 'Logged call update',
  previewData: {
    contactName: 'Danelle',
    callRef: 'CALL-2026-38195',
    sitNumber: '38195',
    loggingCustomer: 'Satio Business Solutions',
    endCustomer: 'InteliGro',
    site: '17 Fortuna Street, Viljoenskroon',
    status: 'On Site',
    engineer: 'Nikita',
    event: 'status',
  },
}

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '20px 25px', maxWidth: '560px' }
const brand = { fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' as const, color: '#666666', margin: '0 0 12px' }
const h1 = { fontSize: '20px', color: '#111111', margin: '0 0 12px' }
const text = { fontSize: '14px', lineHeight: '1.6', color: '#111111' }
const box = { border: '1px solid #e5e5e5', padding: '12px 16px', margin: '16px 0' }
const row = { fontSize: '13px', color: '#111111', margin: '4px 0' }
const hr = { borderColor: '#e5e5e5', margin: '20px 0 12px' }
const footer = { fontSize: '12px', color: '#666666' }
