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

import { createArea, listAreas } from '@/lib/actions/areas'

const areaRow = {
  id: 'area-1',
  scope: 'exterior',
  name: 'Fascia',
  active: true,
  position: 0,
  created_at: '2026-05-15T00:00:00.000Z',
  updated_at: '2026-05-15T00:00:00.000Z',
}

function createAreasListBuilder(response: unknown) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    then: (resolve: (value: unknown) => unknown) => resolve(response),
  }
  return builder
}

function createAreasInsertBuilder(response: unknown) {
  const builder = {
    insert: vi.fn(() => builder),
    select: vi.fn(() => builder),
    single: vi.fn(async () => response),
  }
  return builder
}

describe('area actions against Supabase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.isDevNoAuthMode.mockReturnValue(false)
  })

  it('lists active areas from Supabase in dropdown order', async () => {
    const builder = createAreasListBuilder({ data: [areaRow], error: null })
    mocks.createClient.mockResolvedValueOnce({
      from: vi.fn(() => builder),
    })

    const result = await listAreas()

    expect(result).toEqual({
      ok: true,
      data: [expect.objectContaining({ id: 'area-1', scope: 'exterior', name: 'Fascia' })],
    })
    expect(builder.eq).toHaveBeenCalledWith('active', true)
    expect(builder.order).toHaveBeenCalledTimes(3)
  })

  it('returns Supabase errors when area listing fails', async () => {
    const builder = createAreasListBuilder({ data: null, error: new Error('area read failed') })
    mocks.createClient.mockResolvedValueOnce({
      from: vi.fn(() => builder),
    })

    const result = await listAreas()

    expect(result).toEqual({ ok: false, error: 'area read failed' })
  })

  it('creates an area through Supabase and revalidates consumers', async () => {
    const builder = createAreasInsertBuilder({ data: areaRow, error: null })
    mocks.createClient.mockResolvedValueOnce({
      from: vi.fn(() => builder),
    })

    const result = await createArea({ scope: 'exterior', name: 'Fascia' })

    expect(result.ok).toBe(true)
    expect(builder.insert).toHaveBeenCalledWith({
      scope: 'exterior',
      name: 'Fascia',
      active: true,
      position: 0,
    })
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/settings')
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/quotes/new')
  })
})
