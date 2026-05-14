import { notFound } from 'next/navigation'
import { QuoteForm } from '@/components/quote-form/quote-form'
import { listAreas } from '@/lib/actions/areas'
import { getQuote } from '@/lib/actions/quotes'
import { getPricingSettings } from '@/lib/actions/settings'
import { DEFAULT_PRICING_SETTINGS } from '@/lib/calculator'

interface QuoteEditPageProps {
  params: Promise<{ id: string }>
}

export default async function QuoteEditPage({ params }: QuoteEditPageProps) {
  const { id } = await params
  const [quote, settings, areas] = await Promise.all([
    getQuote(id),
    getPricingSettings(),
    listAreas(),
  ])

  if (!quote.ok || !quote.data) notFound()

  return (
    <QuoteForm
      areas={areas.ok ? areas.data : []}
      initialQuote={quote.data}
      settings={quote.data.pricingSettingsSnapshot ?? (settings.ok ? settings.data : DEFAULT_PRICING_SETTINGS)}
    />
  )
}
