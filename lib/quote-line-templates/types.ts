export type QuoteLineTemplateItemKind = 'line_item' | 'text'

export interface QuoteLineTemplateItemRecord {
  id: string
  templateId: string
  kind: QuoteLineTemplateItemKind
  name: string
  description: string | null
  quantity: string | null
  unitPrice: string | null
  taxable: boolean
  clientVisible: boolean
  linkedProductOrServiceId: string | null
  position: number
  createdAt: string
  updatedAt: string
}

export interface QuoteLineTemplateRecord {
  id: string
  name: string
  active: boolean
  createdAt: string
  updatedAt: string
  items: QuoteLineTemplateItemRecord[]
}

export function normalizeQuoteLineTemplate(record: QuoteLineTemplateRecord): QuoteLineTemplateRecord {
  return {
    ...record,
    name: record.name.trim(),
    items: [...record.items]
      .sort((a, b) => a.position - b.position || a.name.localeCompare(b.name))
      .map((item) => ({
        ...item,
        name: item.name.trim(),
        description: item.description?.trim() || null,
        quantity: item.quantity === null ? null : Number(item.quantity).toFixed(2),
        unitPrice: item.unitPrice === null ? null : Number(item.unitPrice).toFixed(2),
      })),
  }
}
