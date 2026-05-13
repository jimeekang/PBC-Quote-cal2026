import Decimal from 'decimal.js'
import {
  DEFAULT_PRICING_SETTINGS,
  calculateAllFormulas,
  calculateFinal,
  calculateSubtotal,
  type PricingSettings,
} from './calculator'
import { DULUX_PAINT_PRODUCTS } from './products/dulux-paints'
import { normalizeRrpProduct, type ProductRecord } from './products/types'
import type { AreaInput } from './validators'
import type { QuoteInput } from './validators'
import type { AreaRecord } from './areas/types'

export type { ProductRecord }

export interface QuoteRecord {
  id: string
  customerName: string | null
  customerAddress: string | null
  jobberQuoteId: string | null
  areaSqft: number | null
  workType: string | null
  workingDays: string
  labourPerDay: string
  formula1Total: string
  formula2Total: string
  formula3Total: string
  formula4Total: string
  formula5Total: string
  selectedMin: 1 | 2 | 3 | 4 | 5
  selectedMax: 1 | 2 | 3 | 4 | 5
  subtotal: string
  finalTotal: string
  pricingSettingsSnapshot: PricingSettings
  createdAt: string
  items: QuoteItemRecord[]
}

export interface QuoteItemRecord {
  id: string
  quoteId: string
  productId: string | null
  productNameSnapshot: string
  marketPriceSnapshot: string
  actualPriceSnapshot: string
  quantity: string
  areaId: string | null
  areaNameSnapshot: string | null
  areaScopeSnapshot: 'interior' | 'exterior' | null
  isCustom: boolean
  position: number
}

const products: ProductRecord[] = DULUX_PAINT_PRODUCTS.map(normalizeRrpProduct)

interface DevDataStore {
  pricingSettings: PricingSettings
  quotes: QuoteRecord[]
  areas: AreaRecord[]
}

const storeOwner = globalThis as typeof globalThis & {
  __pbcDevDataStore?: DevDataStore
}

const store = storeOwner.__pbcDevDataStore ??= {
  pricingSettings: { ...DEFAULT_PRICING_SETTINGS },
  quotes: [],
  areas: [],
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function money(value: Decimal | number | string): string {
  return new Decimal(value).toFixed(2)
}

function searchTokens(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
}

export function getDevPricingSettings(): PricingSettings {
  return { ...store.pricingSettings }
}

export function updateDevPricingSettings(settings: PricingSettings): PricingSettings {
  store.pricingSettings = { ...settings }
  return getDevPricingSettings()
}

export function listDevAreas(): AreaRecord[] {
  return [...store.areas]
    .filter((area) => area.active)
    .sort((a, b) => a.scope.localeCompare(b.scope) || a.position - b.position || a.name.localeCompare(b.name))
}

export function createDevArea(input: AreaInput): AreaRecord {
  const name = input.name.trim()
  const existing = store.areas.find((area) => area.scope === input.scope && area.name.toLowerCase() === name.toLowerCase())
  if (existing) return existing

  const area: AreaRecord = {
    id: nextId('area'),
    scope: input.scope,
    name,
    active: true,
    position: store.areas.filter((item) => item.scope === input.scope).length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  store.areas = [...store.areas, area]
  return area
}

export function searchDevProducts(query: string, limit = 8): ProductRecord[] {
  const tokens = searchTokens(query)
  if (tokens.length === 0) return products.filter((product) => product.active).slice(0, limit)

  return products
    .filter((product) => {
      const haystack = [
        product.name,
        product.manufacturer,
        product.type,
        product.colorCode,
        product.category,
        product.productLine,
        product.base,
        product.sheen,
        product.unit,
        product.volumeLitres,
        product.productCode,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return product.active && tokens.every((token) => haystack.includes(token))
    })
    .slice(0, limit)
}

export function listDevProducts(query = '', limit = 200): ProductRecord[] {
  return searchDevProducts(query, limit)
}

export function listDevQuotes(query = ''): QuoteRecord[] {
  const needle = query.trim().toLowerCase()
  const filtered = needle
    ? store.quotes.filter((quote) =>
        [quote.customerName, quote.customerAddress, quote.jobberQuoteId]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(needle)
      )
    : store.quotes

  return [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getDevQuote(id: string): QuoteRecord | null {
  return store.quotes.find((quote) => quote.id === id) ?? null
}

export function createDevQuote(input: QuoteInput): QuoteRecord {
  const settings = getDevPricingSettings()
  const formulaResults = calculateAllFormulas(
    {
      workingDays: input.workingDays,
      labourPerDay: input.labourPerDay,
      materialMarket: input.materialMarket,
      materialActual: input.materialActual,
    },
    settings
  )
  const subtotal = calculateSubtotal(formulaResults, input.selectedMin, input.selectedMax)
  const finalTotal = calculateFinal(subtotal)
  const id = nextId('quote')

  const quote: QuoteRecord = {
    id,
    customerName: input.customerName?.trim() || null,
    customerAddress: input.customerAddress?.trim() || null,
    jobberQuoteId: input.jobberQuoteId?.trim() || null,
    areaSqft: input.areaSqft ?? null,
    workType: input.workType?.trim() || null,
    workingDays: money(input.workingDays),
    labourPerDay: money(input.labourPerDay),
    formula1Total: money(formulaResults[0].total),
    formula2Total: money(formulaResults[1].total),
    formula3Total: money(formulaResults[2].total),
    formula4Total: money(formulaResults[3].total),
    formula5Total: money(formulaResults[4].total),
    selectedMin: input.selectedMin,
    selectedMax: input.selectedMax,
    subtotal: money(subtotal),
    finalTotal: money(finalTotal),
    pricingSettingsSnapshot: settings,
    createdAt: new Date().toISOString(),
    items: input.items.map((item, index) => ({
      id: nextId('item'),
      quoteId: id,
      productId: item.productId ?? null,
      productNameSnapshot: item.productNameSnapshot,
      marketPriceSnapshot: money(item.marketPriceSnapshot),
      actualPriceSnapshot: money(item.actualPriceSnapshot),
      quantity: money(item.quantity),
      areaId: item.areaId ?? null,
      areaNameSnapshot: item.areaNameSnapshot ?? null,
      areaScopeSnapshot: item.areaScopeSnapshot ?? null,
      isCustom: item.isCustom,
      position: item.position ?? index,
    })),
  }

  store.quotes = [quote, ...store.quotes]
  return quote
}

export function resetDevData(): void {
  store.pricingSettings = { ...DEFAULT_PRICING_SETTINGS }
  store.quotes = []
  store.areas = []
}
