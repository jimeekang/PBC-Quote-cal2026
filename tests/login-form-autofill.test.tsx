import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { LoginForm } from '@/components/auth/login-form'

vi.mock('@/lib/actions/auth', () => ({
  signIn: vi.fn(),
}))

describe('login form browser autofill', () => {
  it('uses password-manager friendly autocomplete attributes', () => {
    const markup = renderToStaticMarkup(<LoginForm />)

    expect(markup).toContain('name="email"')
    expect(markup).toContain('autoComplete="username"')
    expect(markup).toContain('name="password"')
    expect(markup).toContain('autoComplete="current-password"')
  })
})
