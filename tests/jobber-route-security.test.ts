import { describe, expect, it, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  exchangeAuthorizationCode: vi.fn(),
  getTokenExpiresAt: vi.fn(),
  saveDevJobberToken: vi.fn(),
  createClient: vi.fn(),
  createServiceClient: vi.fn(),
}))

vi.mock('@/lib/jobber/oauth', () => ({
  exchangeAuthorizationCode: mocks.exchangeAuthorizationCode,
  getTokenExpiresAt: mocks.getTokenExpiresAt,
}))

vi.mock('@/lib/jobber/dev-tokens', () => ({
  saveDevJobberToken: mocks.saveDevJobberToken,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: mocks.createClient,
  createServiceClient: mocks.createServiceClient,
}))

import { GET as jobberCallback } from '@/app/api/jobber/callback/route'

describe('jobber callback security', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: 'user-1' } }, error: null })),
      },
    })
    mocks.createServiceClient.mockResolvedValue({
      from: vi.fn(() => ({
        upsert: vi.fn(async () => ({ error: null })),
      })),
    })
    process.env.JOBBER_CLIENT_ID = 'client-id'
    process.env.JOBBER_CLIENT_SECRET = 'client-secret'
    process.env.JOBBER_REDIRECT_URI = 'http://localhost:3000/api/jobber/callback'
  })

  it('rejects OAuth callbacks that do not include the state cookie', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/jobber/callback?code=auth-code&state=state-from-url'
    )

    const response = await jobberCallback(request)

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ ok: false, error: 'Invalid Jobber OAuth state' })
    expect(mocks.exchangeAuthorizationCode).not.toHaveBeenCalled()
  })

  it('rejects Jobber OAuth tokens that include write scopes', async () => {
    mocks.exchangeAuthorizationCode.mockResolvedValueOnce({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: 3600,
      tokenType: 'Bearer',
      scope: 'quotes:read jobs:write',
    })
    mocks.getTokenExpiresAt.mockReturnValueOnce('2026-05-15T00:00:00.000Z')
    const request = new NextRequest(
      'http://localhost:3000/api/jobber/callback?code=auth-code&state=state-from-url',
      {
        headers: {
          cookie: 'jobber_oauth_state=state-from-url',
        },
      }
    )

    const response = await jobberCallback(request)

    expect(response.status).toBe(502)
    expect(await response.json()).toEqual({ ok: false, error: 'Jobber OAuth scopes must be read-only' })
    expect(mocks.saveDevJobberToken).not.toHaveBeenCalled()
    expect(mocks.createClient).not.toHaveBeenCalled()
    expect(mocks.createServiceClient).not.toHaveBeenCalled()
  })
})
