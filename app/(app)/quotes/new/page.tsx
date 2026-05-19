import { QuoteForm } from '@/components/quote-form/quote-form'
import { listAreas } from '@/lib/actions/areas'
import { listProductServices } from '@/lib/actions/product-services'
import { listQuoteLineTemplates } from '@/lib/actions/quote-line-templates'
import { getPricingSettings } from '@/lib/actions/settings'
import { DEFAULT_PRICING_SETTINGS } from '@/lib/calculator'

export default async function QuoteNewPage() {
  const [settings, areas, productServices, quoteLineTemplates] = await Promise.all([
    getPricingSettings(),
    listAreas(),
    listProductServices({ limit: 300 }),
    listQuoteLineTemplates(),
  ])

  return (
    <QuoteForm
      areas={areas.ok ? areas.data : []}
      productServices={productServices.ok ? productServices.data : []}
      quoteLineTemplates={quoteLineTemplates.ok ? quoteLineTemplates.data : []}
      settings={settings.ok ? settings.data : DEFAULT_PRICING_SETTINGS}
    />
  )
}
