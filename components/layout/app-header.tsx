'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/actions/auth'

type NavItem = {
  href: string
  label: string
  icon: 'overview' | 'quote' | 'settings'
}

const navItems: NavItem[] = [
  { href: '/quotes', label: 'Overview', icon: 'overview' },
  { href: '/quotes/new', label: 'New Quote', icon: 'quote' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
]

function NavIcon({ icon }: { icon: NavItem['icon'] }) {
  if (icon === 'quote') {
    return (
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none">
        <path d="M6 4.5h8M6 8h8M6 11.5h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M4.5 2.75h11A1.75 1.75 0 0 1 17.25 4.5v11a1.75 1.75 0 0 1-1.75 1.75h-11A1.75 1.75 0 0 1 2.75 15.5v-11A1.75 1.75 0 0 1 4.5 2.75Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  }

  if (icon === 'settings') {
    return (
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none">
        <path d="M10 12.75A2.75 2.75 0 1 0 10 7.25a2.75 2.75 0 0 0 0 5.5Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M15.4 10.7c.04-.23.06-.46.06-.7s-.02-.47-.06-.7l1.34-1.04-1.28-2.22-1.58.64a5.5 5.5 0 0 0-1.2-.7L12.45 4.3h-2.56l-.24 1.68c-.42.17-.82.4-1.18.68l-1.58-.64-1.28 2.22L6.95 9.3a4.4 4.4 0 0 0 0 1.4l-1.34 1.04 1.28 2.22 1.58-.64c.36.28.76.51 1.18.68l.24 1.68h2.56l.24-1.68c.43-.17.83-.4 1.2-.7l1.57.66 1.28-2.22-1.34-1.04Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none">
      <path d="M3.5 10.5 10 4l6.5 6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.25 9.25v6.25h3.25v-4h3v4h3.25V9.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function AppHeader() {
  const pathname = usePathname()

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/80 bg-white/75 px-5 py-5 shadow-[12px_0_45px_rgb(37_77_128_/_8%)] backdrop-blur lg:block">
        <Link href="/quotes" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--primary)] text-sm font-bold text-white shadow-sm">
            P
          </span>
          <span>
            <span className="block text-sm font-bold text-slate-950">PBC Quote</span>
            <span className="block text-xs font-medium text-slate-400">Calculator</span>
          </span>
        </Link>

        <nav className="mt-9 space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase text-slate-400">Admin tools</p>
          <div className="mt-3 space-y-1">
            {navItems.map((item) => {
              const isActive = item.href === '/quotes'
                ? pathname === '/quotes' || (pathname.startsWith('/quotes/') && !pathname.startsWith('/quotes/new'))
                : pathname.startsWith(item.href)
              const activeClass = isActive
                ? 'bg-[var(--primary)] text-white shadow-sm'
                : 'text-slate-500 hover:bg-white hover:text-slate-950'

              return (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${activeClass}`}>
                  <NavIcon icon={item.icon} />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="mt-10 rounded-lg border border-[var(--border)] bg-white/80 p-3">
          <p className="text-xs font-semibold text-slate-500">Quote workspace</p>
          <p className="mt-1 text-[11px] leading-4 text-slate-400">Live pricing, material costs, Jobber lookup, and PBC labour settings.</p>
        </div>

        <form action={signOut} className="absolute bottom-5 left-5 right-5">
          <button type="submit" className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold text-slate-500 hover:border-[var(--danger)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]">
            Sign out
          </button>
        </form>
      </aside>

      <header className="sticky top-0 z-30 border-b border-white/80 bg-white/70 backdrop-blur">
        <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/quotes" className="flex items-center gap-3 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--primary)] text-xs font-bold text-white">P</span>
            <span className="text-sm font-bold text-slate-950">PBC Quote</span>
          </Link>

          <Link href="/quotes" className="hidden min-w-0 flex-1 items-center gap-3 rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm text-slate-400 shadow-sm sm:flex lg:max-w-md">
            <svg aria-hidden="true" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="none">
              <path d="m14.5 14.5 2.5 2.5M8.75 15.25a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            Search quotes from Overview
          </Link>

          <nav className="flex items-center gap-2 text-sm lg:hidden">
            <Link href="/quotes/new" className="rounded-lg bg-[var(--primary)] px-3 py-2 font-semibold text-white">
              New
            </Link>
            <Link href="/settings" className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 font-semibold text-slate-600">
              Settings
            </Link>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <div className="text-right">
              <p className="text-xs text-slate-400">Workspace</p>
              <p className="text-sm font-semibold text-slate-800">PBC Admin</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-[var(--primary-soft)] ring-4 ring-white" />
          </div>
        </div>
      </header>
    </>
  )
}
