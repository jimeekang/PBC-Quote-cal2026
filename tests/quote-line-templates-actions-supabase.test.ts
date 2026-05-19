import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  isDevNoAuthMode: vi.fn(),
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: mocks.createClient,
}))

vi.mock('@/lib/actions/types', async () => {
  const actual = await vi.importActual<typeof import('@/lib/actions/types')>('@/lib/actions/types')
  return {
    ...actual,
    isDevNoAuthMode: mocks.isDevNoAuthMode,
  }
})

vi.mock('next/cache', () => ({
  revalidatePath: mocks.revalidatePath,
}))

import { createQuoteLineTemplate, listQuoteLineTemplates } from '@/lib/actions/quote-line-templates'

const templateRow = {
  id: '00000000-0000-4000-8000-000000000021',
  name: 'Standard quote text',
  active: true,
  created_at: '2026-05-19T00:00:00.000Z',
  updated_at: '2026-05-19T00:00:00.000Z',
  quote_line_template_items: [
    {
      id: '00000000-0000-4000-8000-000000000022',
      template_id: '00000000-0000-4000-8000-000000000021',
      kind: 'text',
      name: 'Dulux Accredited Painting Company',
      description: 'Accreditation paragraph',
      quantity: null,
      unit_price: null,
      taxable: false,
      client_visible: true,
      linked_product_or_service_id: null,
      position: 0,
      created_at: '2026-05-19T00:00:00.000Z',
      updated_at: '2026-05-19T00:00:00.000Z',
    },
  ],
}

function createTemplateBuilder(response: unknown) {
  const builder = {
    insert: vi.fn(() => builder),
    select: vi.fn(() => builder),
    single: vi.fn(async () => response),
  }
  return builder
}

function createItemBuilder(response: unknown) {
  const builder = {
    insert: vi.fn(() => builder),
    select: vi.fn(async () => response),
  }
  return builder
}

function createListBuilder(response: unknown) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    then: (resolve: (value: unknown) => unknown) => resolve(response),
  }
  return builder
}

describe('quote line template actions against Supabase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.isDevNoAuthMode.mockReturnValue(false)
  })

  it('creates a template parent row and child line items', async () => {
    const templateBuilder = createTemplateBuilder({ data: templateRow, error: null })
    const itemBuilder = createItemBuilder({ data: templateRow.quote_line_template_items, error: null })
    const from = vi.fn((table: string) => {
      if (table === 'quote_line_templates') return templateBuilder
      if (table === 'quote_line_template_items') return itemBuilder
      throw new Error(`unexpected table ${table}`)
    })
    mocks.createClient.mockResolvedValueOnce({ from })

    const result = await createQuoteLineTemplate({
      name: 'Standard quote text',
      items: [
        {
          kind: 'text',
          name: 'Dulux Accredited Painting Company',
          description: 'Accreditation paragraph',
          clientVisible: true,
          position: 0,
        },
      ],
    })

    expect(result.ok).toBe(true)
    expect(templateBuilder.insert).toHaveBeenCalledWith({ name: 'Standard quote text', active: true })
    expect(itemBuilder.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        template_id: templateRow.id,
        kind: 'text',
        name: 'Dulux Accredited Painting Company',
        unit_price: null,
        taxable: false,
      }),
    ])
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/settings')
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/quotes/new')
  })

  it('lists active templates with ordered line items', async () => {
    const listBuilder = createListBuilder({ data: [templateRow], error: null })
    mocks.createClient.mockResolvedValueOnce({ from: vi.fn(() => listBuilder) })

    const result = await listQuoteLineTemplates()

    expect(result.ok).toBe(true)
    expect(listBuilder.select).toHaveBeenCalledWith(expect.stringContaining('quote_line_template_items'))
    expect(listBuilder.eq).toHaveBeenCalledWith('active', true)
    if (result.ok) {
      expect(result.data[0].items[0].name).toBe('Dulux Accredited Painting Company')
    }
  })
})
