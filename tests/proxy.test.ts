import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it } from 'vitest'
import { proxy } from '@/proxy'

function makeRequest(path: string, cookie = '') {
  return new NextRequest(`http://localhost:3000${path}`, {
    headers: cookie ? { cookie } : undefined,
  })
}

describe('proxy auth routing', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_DEV_NO_AUTH = 'false'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abc123.supabase.co'
  })

  it('redirects protected pages to login when no session cookie exists', async () => {
    const response = await proxy(makeRequest('/quotes'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/login')
  })

  it('keeps login reachable when only a stale session cookie exists', async () => {
    const response = await proxy(makeRequest('/login', 'sb-abc123-auth-token=stale'))

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
  })
})
