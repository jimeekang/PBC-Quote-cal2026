import { SettingsForm } from '@/components/settings/settings-form'
import { listAreas } from '@/lib/actions/areas'
import { listProductServices } from '@/lib/actions/product-services'
import { listProducts } from '@/lib/actions/products'
import { listQuoteLineTemplates } from '@/lib/actions/quote-line-templates'
import { getPricingSettings } from '@/lib/actions/settings'
import type { ActionResult } from '@/lib/actions/types'
import type { AreaRecord } from '@/lib/areas/types'
import { DEFAULT_PRICING_SETTINGS } from '@/lib/calculator'
import type { ProductRecord } from '@/lib/products/types'
import type { PricingSettings } from '@/lib/calculator'
import type { ProductServiceRecord } from '@/lib/product-services/types'
import type { QuoteLineTemplateRecord } from '@/lib/quote-line-templates/types'

function formatErrorMessage(error: unknown, label: string) {
  const text = error instanceof Error ? error.message : 'Unknown error'
  return `${label}: ${text}`
}

async function safeResult<T>(promise: Promise<ActionResult<T>>, label: string): Promise<ActionResult<T>> {
  try {
    return await promise
  } catch (error) {
    return { ok: false, error: formatErrorMessage(error, label) }
  }
}

type SettingsPageState = {
  settings: ActionResult<PricingSettings>
  products: ActionResult<ProductRecord[]>
  productServices: ActionResult<ProductServiceRecord[]>
  quoteLineTemplates: ActionResult<QuoteLineTemplateRecord[]>
  areas: ActionResult<AreaRecord[]>
}

function normalizeResult<T>(result: ActionResult<T> | undefined | null, label: string): ActionResult<T> {
  if (result && typeof result === 'object' && 'ok' in result) {
    return result
  }
  return { ok: false, error: `${label}: missing result` }
}

export default async function SettingsPage() {
  const [
    rawSettingsResult,
    rawProductsResult,
    rawProductServicesResult,
    rawQuoteLineTemplatesResult,
    rawAreasResult,
  ] = await Promise.all([
    safeResult(getPricingSettings(), 'Failed to load pricing settings'),
    safeResult(listProducts({ limit: 200 }), 'Failed to load products'),
    safeResult(listProductServices({ limit: 300 }), 'Failed to load product services'),
    safeResult(listQuoteLineTemplates(), 'Failed to load quote line templates'),
    safeResult(listAreas(), 'Failed to load areas'),
  ])

  const normalized: SettingsPageState = {
    settings: normalizeResult(rawSettingsResult as ActionResult<PricingSettings> | undefined, 'Failed to load pricing settings'),
    products: normalizeResult(rawProductsResult as ActionResult<ProductRecord[]> | undefined, 'Failed to load products'),
    productServices: normalizeResult(rawProductServicesResult as ActionResult<ProductServiceRecord[]> | undefined, 'Failed to load product services'),
    quoteLineTemplates: normalizeResult(rawQuoteLineTemplatesResult as ActionResult<QuoteLineTemplateRecord[]> | undefined, 'Failed to load quote line templates'),
    areas: normalizeResult(rawAreasResult as ActionResult<AreaRecord[]> | undefined, 'Failed to load areas'),
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase text-slate-400">Admin tools</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Control labour rates, material pricing, and quote areas.</p>
        {!normalized.settings.ok ? (
          <p className="mt-1 text-sm text-red-600">{normalized.settings.error}</p>
        ) : null}
        {!normalized.products.ok ? (
          <p className="mt-1 text-sm text-red-600">{normalized.products.error}</p>
        ) : null}
        {!normalized.productServices.ok ? (
          <p className="mt-1 text-sm text-red-600">{normalized.productServices.error}</p>
        ) : null}
        {!normalized.quoteLineTemplates.ok ? (
          <p className="mt-1 text-sm text-red-600">{normalized.quoteLineTemplates.error}</p>
        ) : null}
        {!normalized.areas.ok ? <p className="mt-1 text-sm text-red-600">{normalized.areas.error}</p> : null}
      </div>
      <SettingsForm
        initialAreas={normalized.areas.ok ? normalized.areas.data : []}
        initialProducts={normalized.products.ok ? normalized.products.data : []}
        initialProductServices={normalized.productServices.ok ? normalized.productServices.data : []}
        initialQuoteLineTemplates={normalized.quoteLineTemplates.ok ? normalized.quoteLineTemplates.data : []}
        initialSettings={normalized.settings.ok ? normalized.settings.data : DEFAULT_PRICING_SETTINGS}
      />
    </main>
  )
}
