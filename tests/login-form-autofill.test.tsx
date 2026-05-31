import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import LoginPage from '@/app/(auth)/login/page'
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

  it('uses shared design-system auth, field, input, and button classes', () => {
    const pageMarkup = renderToStaticMarkup(<LoginPage />)
    const formMarkup = renderToStaticMarkup(<LoginForm />)

    expect(pageMarkup).toContain('pbc-auth')
    expect(pageMarkup).toContain('pbc-authcard')
    expect(pageMarkup).toContain('pbc-brand__mark')
    expect(formMarkup).toContain('pbc-form')
    expect(formMarkup).toContain('pbc-field')
    expect(formMarkup).toContain('pbc-field__label')
    expect(formMarkup).toContain('pbc-input')
    expect(formMarkup).toContain('pbc-btn pbc-btn--primary')
  })
})
