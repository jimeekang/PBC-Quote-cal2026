export interface ProductServiceRecord {
  id: string
  name: string
  description: string | null
  category: string | null
  unitPrice: string
  unitCost: string | null
  bookable: boolean
  durationMinutes: number | null
  quantityEnabled: boolean
  minimumQuantity: string | null
  maximumQuantity: string | null
  taxable: boolean
  active: boolean
  createdAt: string
  updatedAt: string
}

export function normalizeProductService(record: ProductServiceRecord): ProductServiceRecord {
  return {
    ...record,
    name: record.name.trim(),
    description: record.description?.trim() || null,
    category: record.category?.trim() || null,
    unitPrice: Number(record.unitPrice).toFixed(2),
    unitCost: record.unitCost === null ? null : Number(record.unitCost).toFixed(2),
    minimumQuantity: record.minimumQuantity === null ? null : Number(record.minimumQuantity).toFixed(2),
    maximumQuantity: record.maximumQuantity === null ? null : Number(record.maximumQuantity).toFixed(2),
  }
}
