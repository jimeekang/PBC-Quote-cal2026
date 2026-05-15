import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const migrationsDir = join(process.cwd(), 'supabase', 'migrations')

const migrations = [
  '0002_rls_policies.sql',
  '0005_add_quote_areas.sql',
  '0007_add_jobber_tokens.sql',
  '0009_add_quote_options.sql',
].map((file) => ({
  file,
  sql: readFileSync(join(migrationsDir, file), 'utf8'),
}))

const combinedSql = migrations.map(({ sql }) => sql).join('\n')

const authenticatedCrudTables = [
  'products',
  'pricing_settings',
  'quotes',
  'quote_items',
  'quote_areas',
  'quote_options',
  'quote_option_items',
]

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function expectRlsEnabled(table: string): void {
  expect(combinedSql).toMatch(
    new RegExp(`ALTER\\s+TABLE\\s+${escapeRegExp(table)}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, 'i')
  )
}

function expectAuthenticatedCrudPolicy(table: string): void {
  expect(combinedSql).toMatch(
    new RegExp(
      `CREATE\\s+POLICY\\s+"authenticated_all"\\s+ON\\s+${escapeRegExp(table)}\\s+FOR\\s+ALL\\s+TO\\s+authenticated\\s+USING\\s*\\(true\\)\\s+WITH\\s+CHECK\\s*\\(true\\)`,
      'i'
    )
  )
}

describe('RLS migrations', () => {
  it('enables RLS on every application table', () => {
    for (const table of [...authenticatedCrudTables, 'jobber_tokens']) {
      expectRlsEnabled(table)
    }
  })

  it('grants authenticated CRUD only on non-secret application tables', () => {
    for (const table of authenticatedCrudTables) {
      expectAuthenticatedCrudPolicy(table)
    }
  })

  it('keeps Jobber OAuth tokens service-role only', () => {
    const jobberMigration = migrations.find(({ file }) => file === '0007_add_jobber_tokens.sql')
    expect(jobberMigration?.sql).toBeDefined()
    expect(jobberMigration?.sql).not.toMatch(/CREATE\s+POLICY[\s\S]+ON\s+jobber_tokens/i)
  })

  it('does not define anonymous access policies', () => {
    expect(combinedSql).not.toMatch(/\bTO\s+anon\b/i)
    expect(combinedSql).not.toMatch(/\bTO\s+public\b/i)
  })
})
