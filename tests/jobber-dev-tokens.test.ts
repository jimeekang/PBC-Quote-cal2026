import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { JobberConfig } from '@/lib/jobber/config'

const mocks = vi.hoisted(() => ({
  isDevNoAuthMode: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
  refreshAccessToken: vi.fn(),
}))

vi.mock('@/lib/actions/types', () => ({
  isDevNoAuthMode: mocks.isDevNoAuthMode,
}))

vi.mock('node:fs/promises', () => ({
  readFile: mocks.readFile,
  writeFile: mocks.writeFile,
}))

vi.mock('@/lib/jobber/oauth', () => ({
  getTokenExpiresAt: () => '2026-05-15T01:00:00.000Z',
  refreshAccessToken: mocks.refreshAccessToken,
}))

import { getUsableDevJobberToken, saveDevJobberToken } from '@/lib/jobber/dev-tokens'

const config: JobberConfig = {
  clientId: 'client-id',
  clientSecret: 'client-secret',
  redirectUri: 'https://example.com/api/jobber/callback',
  graphqlVersion: '2025-04-16',
  accessToken: '',
}

describe('jobber dev tokens', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete globalThis.__pbcJobberDevToken
    mocks.isDevNoAuthMode.mockReturnValue(true)
    mocks.readFile.mockRejectedValue(new Error('missing dev token file'))
  })

  it('persists read-only scope metadata for local dev Jobber tokens', async () => {
    const token = await saveDevJobberToken({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: 3600,
      tokenType: 'Bearer',
      scope: 'quotes:read',
    })

    expect(token.scope).toBe('quotes:read')
    expect(mocks.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('.jobber.local.json'),
      expect.stringContaining('"scope": "quotes:read"'),
      { mode: 0o600 }
    )
  })

  it('does not persist local dev Jobber tokens with write scopes', async () => {
    await expect(saveDevJobberToken({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: 3600,
      tokenType: 'Bearer',
      scope: 'quotes:read jobs:write',
    })).rejects.toThrow('Jobber OAuth scopes must be read-only')

    expect(mocks.writeFile).not.toHaveBeenCalled()
    expect(globalThis.__pbcJobberDevToken).toBeUndefined()
  })

  it('rejects local dev Jobber tokens loaded from disk with write scopes', async () => {
    mocks.readFile.mockResolvedValueOnce(JSON.stringify({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      scope: 'quotes:read jobs:write',
      expiresAt: '2099-05-15T00:00:00.000Z',
    }))

    await expect(getUsableDevJobberToken(config)).rejects.toThrow('Jobber OAuth scopes must be read-only')
  })
})
