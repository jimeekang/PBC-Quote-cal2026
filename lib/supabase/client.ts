import { createBrowserClient } from '@supabase/ssr'
import { requireSupabaseBrowserConfig } from './env'
import type { Database } from './types'

export function createClient() {
  const { url, key } = requireSupabaseBrowserConfig()

  return createBrowserClient<Database>(url, key)
}
