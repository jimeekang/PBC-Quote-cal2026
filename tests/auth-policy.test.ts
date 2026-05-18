import { describe, expect, it } from 'vitest'
import { isAuthenticatedUserAllowed, isLoginEmailAllowed } from '@/lib/security/auth-policy'

describe('auth policy', () => {
  it('requires an explicit login allowlist in production', () => {
    expect(isLoginEmailAllowed('owner@example.com', '', 'production')).toBe(false)
    expect(isAuthenticatedUserAllowed({ email: 'owner@example.com' }, '', 'production')).toBe(false)
  })

  it('allows only configured emails when a login allowlist is present', () => {
    const allowlist = 'owner@example.com, staff@example.com'

    expect(isLoginEmailAllowed('OWNER@example.com', allowlist, 'production')).toBe(true)
    expect(isLoginEmailAllowed('intruder@example.com', allowlist, 'production')).toBe(false)
    expect(isAuthenticatedUserAllowed({ email: 'staff@example.com' }, allowlist, 'production')).toBe(true)
  })
})
