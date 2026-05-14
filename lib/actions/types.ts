import { hasSupabaseBrowserConfig } from '@/lib/supabase/env'

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }

export function isDevNoAuthMode(): boolean {
  if (process.env.NODE_ENV === 'production') return false
  if (process.env.NEXT_PUBLIC_DEV_NO_AUTH === 'true') return true
  if (process.env.NEXT_PUBLIC_DEV_NO_AUTH === 'false') return false

  return !hasSupabaseBrowserConfig()
}
