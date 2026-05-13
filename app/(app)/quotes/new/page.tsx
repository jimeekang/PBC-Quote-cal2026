import { QuoteForm } from '@/components/quote-form/quote-form'
import { listAreas } from '@/lib/actions/areas'
import { getPricingSettings } from '@/lib/actions/settings'
import { DEFAULT_PRICING_SETTINGS } from '@/lib/calculator'

export default async function QuoteNewPage() {
  const [settings, areas] = await Promise.all([
    getPricingSettings(),
    listAreas(),
  ])

  return (
    <QuoteForm
      areas={areas.ok ? areas.data : []}
      settings={settings.ok ? settings.data : DEFAULT_PRICING_SETTINGS}
    />
  )
}
