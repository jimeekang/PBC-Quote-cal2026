import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { AppHeader } from '@/components/layout/app-header'
import type { UserProfile } from '@/lib/user-profiles'

const sidebarPreference = vi.hoisted(() => ({ collapsed: false }))

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    useSyncExternalStore: vi.fn(() => sidebarPreference.collapsed),
  }
})

vi.mock('next/navigation', () => ({
  usePathname: () => '/quotes/new',
}))

vi.mock('@/lib/actions/auth', () => ({
  signOut: vi.fn(),
}))

describe('AppHeader sidebar UI', () => {
  const userProfile: UserProfile = {
    id: 'user-1',
    displayName: 'Mia Kang',
    email: 'mia@example.com',
  }

  it('renders the desktop sidebar toggle and expanded state markup', () => {
    sidebarPreference.collapsed = false
    const markup = renderToStaticMarkup(createElement(AppHeader, { userProfile }))

    expect(markup).toContain('aria-label="Toggle sidebar"')
    expect(markup).toContain('data-sidebar-state="expanded"')
    expect(markup).toContain('Overview')
    expect(markup).toContain('New Quote')
    expect(markup).toContain('Settings')
    expect(markup).toContain('pbc-usercard__identity')
  })

  it('renders the collapsed sidebar as an icon rail without text buttons', () => {
    sidebarPreference.collapsed = true
    const markup = renderToStaticMarkup(createElement(AppHeader, { userProfile }))

    expect(markup).toContain('data-sidebar-state="collapsed"')
    expect(markup).toContain('flex-col items-center gap-3')
    expect(markup).toContain('pbc-usercard pbc-usercard--collapsed')
    expect(markup).toContain('pbc-signout pbc-signout--collapsed')
    expect(markup).toContain('aria-label="Sign out"')
    expect(markup).toContain('<span class="sr-only">Sign out</span>')
    expect(markup).not.toContain('>Out</button>')
  })
})
