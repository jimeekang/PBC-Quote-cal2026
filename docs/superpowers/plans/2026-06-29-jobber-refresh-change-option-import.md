# Jobber Refresh, Change Alert, Option Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add manual Jobber refresh with last refresh time, refresh-based change alerts, and preview/manual import for Jobber option line items into PBC quote options.

**Architecture:** Keep Jobber as the source for external quote snapshots, but do not auto-overwrite internal PBC pricing decisions. Refresh writes a new `jobber_snapshot`, stores refresh metadata, and records a compact diff summary. Option import is client-side preview/manual confirm: detected Jobber option candidates become PBC `QuoteOptionItem` state only when the user imports them.

**Tech Stack:** Next.js App Router, Server Actions, Supabase/Postgres, TypeScript strict, Decimal.js, Vitest/React Testing Library.

---

## Scope And Decisions

- Use a dedicated refresh timestamp, not `jobber_last_synced_at`. `jobber_last_synced_at` means write-back sync success; refresh timestamp means Jobber snapshot fetch time.
- Add repo migration only in this implementation. Production Supabase apply remains a separate user-approved operation.
- Persist only a compact change summary. Do not store an unbounded raw diff payload.
- Option import is preview/manual confirm. No automatic save to DB until the normal quote save/update flow runs.
- Jobber option detection is conservative:
  - A text line with `option`, `optional`, `alternate`, `alternative`, `add-on`, or `addon` starts an option group.
  - Priced lines after that heading belong to the group until another heading.
  - A priced line whose name starts with those markers can be a one-line candidate.
  - Non-matching Jobber public lines remain normal Product / Service lines and are not imported as options.
- Imported PBC options use custom material rows with zero labour. Because all five formulas equal material total when labour is zero, selected range `F1-F1` preserves the Jobber line total as the option subtotal.

---

## File Structure

**Create**
- `supabase/migrations/0020_add_jobber_snapshot_refresh_metadata.sql`  
  Adds refresh metadata columns to `quotes`.
- `lib/jobber/snapshot-diff.ts`  
  Pure comparison helpers for saved vs fresh Jobber snapshots.
- `components/quote-detail/jobber-refresh-panel.tsx`  
  Client UI for refresh button, pending state, returned errors, last refreshed time, and persisted change alert.
- `components/quote-form/jobber-option-import.tsx`  
  Client UI for Jobber option candidate preview and manual import.
- `components/quote-form/jobber-option-mapping.ts`  
  Pure helpers that detect Jobber option candidates and convert them into `QuoteOptionItem` values.
- `tests/jobber-snapshot-diff.test.ts`  
  Unit tests for diff behavior.
- `tests/jobber-option-mapping.test.ts`  
  Unit tests for option candidate detection and conversion.

**Modify**
- `lib/supabase/types.ts`  
  Add new `quotes` columns to manual Supabase types.
- `lib/dev-data.ts`  
  Extend `QuoteRecord`, dev quote creation/update, and optional dev refresh metadata.
- `lib/actions/quotes.ts`  
  Add `refreshJobberQuoteSnapshot`, update `toQuoteRecord`, update `markJobberSyncStatus` to stamp refresh metadata when write-back fetches a new snapshot.
- `components/quote-detail/quote-detail-view.tsx`  
  Replace static Jobber data header with refresh panel.
- `components/quote-form/quote-form.tsx`  
  Render option import preview between Product / Service and PBC Options; wire imported candidates into `options`.
- `components/quote-form/types.ts`  
  Add optional `sourceJobberLineItemIds?: string[]` to `QuoteOptionItem` for UI duplicate prevention.
- `components/quote-form/quote-draft.ts`  
  Preserve optional imported option source IDs in local draft parsing/sanitization.
- `components/quote-form/quote-save-payload.ts`  
  Ignore UI-only `sourceJobberLineItemIds` when building persisted option payload.
- `tests/quote-actions.test.ts`, `tests/quote-actions-supabase.test.ts`  
  Cover refresh action success/error paths and metadata mapping.
- `tests/quote-ui.test.tsx`  
  Cover detail refresh UI, change alert, and option import preview/manual confirm.
- `PROGRESS.md`, `TODOS.md`, `docs/DECISIONS.md`, `docs/ARCHITECTURE.md`  
  Update after implementation and verification.

---

## Task 1: DB Shape And Domain Types

**Files:**
- Create: `supabase/migrations/0020_add_jobber_snapshot_refresh_metadata.sql`
- Modify: `lib/supabase/types.ts`
- Modify: `lib/dev-data.ts`

- [ ] **Step 1: Add migration**

Create:

```sql
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS jobber_snapshot_refreshed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS jobber_snapshot_change_status TEXT NOT NULL DEFAULT 'unknown' CHECK (
    jobber_snapshot_change_status IN ('unknown', 'unchanged', 'changed')
  ),
  ADD COLUMN IF NOT EXISTS jobber_snapshot_change_summary JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS jobber_snapshot_refresh_error TEXT;
```

- [ ] **Step 2: Update manual Supabase types**

Add these fields to `Database['public']['Tables']['quotes']['Row']`:

```ts
jobber_snapshot_refreshed_at: string | null
jobber_snapshot_change_status: 'unknown' | 'unchanged' | 'changed'
jobber_snapshot_change_summary: Json
jobber_snapshot_refresh_error: string | null
```

No separate Insert/Update fields are needed because the current type derives them from `Row`.

- [ ] **Step 3: Extend QuoteRecord**

Add to `QuoteRecord` in `lib/dev-data.ts`:

```ts
jobberSnapshotRefreshedAt: string | null
jobberSnapshotChangeStatus: 'unknown' | 'unchanged' | 'changed'
jobberSnapshotChangeSummary: JobberSnapshotChangeSummaryItem[]
jobberSnapshotRefreshError: string | null
```

Also add:

```ts
export interface JobberSnapshotChangeSummaryItem {
  field: 'customer' | 'address' | 'workType' | 'customerType' | 'lineItems' | 'financialSummary'
  label: string
  before: string
  after: string
}
```

- [ ] **Step 4: Set dev-data defaults**

When creating a dev quote, set:

```ts
jobberSnapshotRefreshedAt: input.jobberSnapshot ? new Date().toISOString() : null,
jobberSnapshotChangeStatus: 'unknown',
jobberSnapshotChangeSummary: [],
jobberSnapshotRefreshError: null,
```

- [ ] **Step 5: Run focused typecheck**

Run:

```powershell
npm.cmd run typecheck
```

Expected: fail only where new `QuoteRecord` fields are not yet mapped. Those failures guide Task 3.

---

## Task 2: Snapshot Diff Helper

**Files:**
- Create: `lib/jobber/snapshot-diff.ts`
- Test: `tests/jobber-snapshot-diff.test.ts`

- [ ] **Step 1: Write failing tests**

Create tests for unchanged snapshots, customer/address changes, line item amount changes, added/removed line items, and null previous snapshot.

Example expectations:

```ts
expect(diffJobberSnapshots(previous, next)).toEqual({
  status: 'changed',
  summary: [
    {
      field: 'lineItems',
      label: 'Product / Service total changed',
      before: '$120.00',
      after: '$180.00',
    },
  ],
})
```

- [ ] **Step 2: Implement helper**

Create:

```ts
import Decimal from 'decimal.js'
import type { JobberQuoteDraft, JobberQuoteDraftLineItem } from './mapper'
import type { JobberSnapshotChangeSummaryItem } from '@/lib/dev-data'

export type JobberSnapshotChangeStatus = 'unknown' | 'unchanged' | 'changed'

export interface JobberSnapshotDiff {
  status: JobberSnapshotChangeStatus
  summary: JobberSnapshotChangeSummaryItem[]
}

export function diffJobberSnapshots(
  previous: JobberQuoteDraft | null,
  next: JobberQuoteDraft
): JobberSnapshotDiff {
  if (!previous) return { status: 'unknown', summary: [] }

  const summary: JobberSnapshotChangeSummaryItem[] = []
  pushTextChange(summary, 'customer', 'Customer changed', previous.customerName, next.customerName)
  pushTextChange(summary, 'address', 'Address changed', previous.customerAddress, next.customerAddress)
  pushTextChange(summary, 'workType', 'Work type changed', previous.workType, next.workType)
  pushTextChange(summary, 'customerType', 'Customer type changed', previous.customerType, next.customerType)
  pushMoneyChange(summary, 'financialSummary', 'Jobber quote total changed', previous.financialSummary.quoteTotal, next.financialSummary.quoteTotal)
  pushLineItemChange(summary, previous.productsAndServices, next.productsAndServices)

  return {
    status: summary.length > 0 ? 'changed' : 'unchanged',
    summary: summary.slice(0, 8),
  }
}
```

Implement private helpers:

```ts
function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

function formatMoney(value: number): string {
  return `$${new Decimal(value).toFixed(2)}`
}
```

Line item comparison should compare stable signatures:

```ts
function lineSignature(line: JobberQuoteDraftLineItem): string {
  return [
    line.id,
    normalizeText(line.name),
    normalizeText(line.description),
    line.quantity.toFixed(4),
    new Decimal(line.unitPrice).toFixed(2),
    new Decimal(line.totalPrice).toFixed(2),
    line.textOnly === true ? 'text' : 'line',
  ].join('|')
}
```

- [ ] **Step 3: Run helper tests**

Run:

```powershell
npm.cmd run test:run -- tests/jobber-snapshot-diff.test.ts
```

Expected: all tests pass.

---

## Task 3: Refresh Server Action

**Files:**
- Modify: `lib/actions/quotes.ts`
- Modify: `lib/dev-data.ts`
- Test: `tests/quote-actions.test.ts`
- Test: `tests/quote-actions-supabase.test.ts`

- [ ] **Step 1: Write failing action tests**

Cover:
- rejects blank quote id
- rejects quote with no `jobber_quote_id`
- fetches Jobber quote, compares old snapshot, stores new snapshot, sets `jobber_snapshot_refreshed_at`
- stores `changed` with summary when line item differs
- stores `unchanged` with empty summary when no meaningful difference
- records `jobber_snapshot_refresh_error` when fetch fails

- [ ] **Step 2: Map new row fields in `toQuoteRecord`**

Add:

```ts
jobberSnapshotRefreshedAt: row.jobber_snapshot_refreshed_at ?? null,
jobberSnapshotChangeStatus: row.jobber_snapshot_change_status ?? 'unknown',
jobberSnapshotChangeSummary: parseJobberSnapshotChangeSummary(row.jobber_snapshot_change_summary),
jobberSnapshotRefreshError: row.jobber_snapshot_refresh_error ?? null,
```

Create parser:

```ts
function parseJobberSnapshotChangeSummary(value: unknown): JobberSnapshotChangeSummaryItem[] {
  if (!Array.isArray(value)) return []
  return value.filter(isJobberSnapshotChangeSummaryItem).slice(0, 8)
}
```

- [ ] **Step 3: Add server action**

Add:

```ts
export async function refreshJobberQuoteSnapshot(quoteId: string): Promise<ActionResult<{
  id: string
  status: 'unknown' | 'unchanged' | 'changed'
}>> {
  const id = quoteId.trim()
  if (!id) return { ok: false, error: 'Quote id is required' }

  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return { ok: false, error: 'Authentication required' }

  const { data, error } = await supabase
    .from('quotes')
    .select('id, jobber_quote_id, jobber_snapshot')
    .eq('id', id)
    .single()
  if (error) return { ok: false, error: error.message }
  if (!data?.jobber_quote_id) return { ok: false, error: 'Saved quote is not linked to Jobber' }

  const previousSnapshot = parseJobberSnapshot(data.jobber_snapshot)
  try {
    const freshSnapshot = await fetchJobberSnapshotForUser(userData.user.id, data.jobber_quote_id)
    const diff = diffJobberSnapshots(previousSnapshot, freshSnapshot)
    const refreshedAt = new Date().toISOString()

    const { error: updateError } = await supabase
      .from('quotes')
      .update({
        jobber_snapshot: freshSnapshot as unknown as Json,
        jobber_snapshot_refreshed_at: refreshedAt,
        jobber_snapshot_change_status: diff.status,
        jobber_snapshot_change_summary: diff.summary as unknown as Json,
        jobber_snapshot_refresh_error: null,
      })
      .eq('id', id)

    if (updateError) return { ok: false, error: updateError.message }
    revalidatePath('/quotes')
    revalidatePath(`/quotes/${id}`)
    revalidatePath(`/quotes/${id}/edit`)
    return { ok: true, data: { id, status: diff.status } }
  } catch (error) {
    const message = getSyncErrorMessage(error)
    await supabase
      .from('quotes')
      .update({ jobber_snapshot_refresh_error: message.slice(0, 500) })
      .eq('id', id)
    revalidatePath(`/quotes/${id}`)
    return { ok: false, error: message }
  }
}
```

Use a private `fetchJobberSnapshotForUser` that mirrors the existing token/refresh behavior used by `syncSavedQuoteToJobber`.

- [ ] **Step 4: Stamp refresh metadata after successful write-back snapshot refresh**

When `syncSavedQuoteToJobber` fetches `refreshedSnapshot`, call `markJobberSyncStatus` with metadata:

```ts
await markJobberSyncStatus(params.supabase, params.quoteId, 'synced', null, refreshedSnapshot)
```

Update `markJobberSyncStatus` so `snapshot !== undefined` also sets:

```ts
jobber_snapshot_refreshed_at: snapshot ? new Date().toISOString() : null,
jobber_snapshot_change_status: 'unknown',
jobber_snapshot_change_summary: [],
jobber_snapshot_refresh_error: null,
```

This keeps sync refresh separate from manual change detection.

- [ ] **Step 5: Run action tests**

Run:

```powershell
npm.cmd run test:run -- tests/quote-actions.test.ts tests/quote-actions-supabase.test.ts
```

Expected: all tests pass.

---

## Task 4: Detail Refresh UI And Change Alert

**Files:**
- Create: `components/quote-detail/jobber-refresh-panel.tsx`
- Modify: `components/quote-detail/quote-detail-view.tsx`
- Test: `tests/quote-ui.test.tsx`

- [ ] **Step 1: Write failing UI tests**

Cover:
- detail page shows `Last refreshed from Jobber` when `jobberSnapshotRefreshedAt` exists
- detail page shows `Refresh from Jobber` button when quote has `jobberQuoteId`
- changed status renders warning alert with summary rows
- refresh error renders danger alert

- [ ] **Step 2: Create refresh panel**

Create a client component:

```tsx
'use client'

import { useTransition, useState } from 'react'
import type { QuoteRecord } from '@/lib/dev-data'
import { refreshJobberQuoteSnapshot } from '@/lib/actions/quotes'
import { Icons } from '@/components/ui/icons'

export function JobberRefreshPanel({ quote }: { quote: QuoteRecord }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  if (!quote.jobberQuoteId) return null

  function refresh() {
    setError(null)
    startTransition(async () => {
      const result = await refreshJobberQuoteSnapshot(quote.id)
      if (!result.ok) setError(result.error)
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="pbc-listitem__meta">
            Last refreshed from Jobber: {quote.jobberSnapshotRefreshedAt ? new Date(quote.jobberSnapshotRefreshedAt).toLocaleString('en-AU') : 'Not refreshed yet'}
          </p>
        </div>
        <button type="button" onClick={refresh} disabled={isPending} className="pbc-btn pbc-btn--ghost pbc-btn--sm">
          {Icons.refresh({ size: 14 })} {isPending ? 'Refreshing...' : 'Refresh from Jobber'}
        </button>
      </div>
      {error || quote.jobberSnapshotRefreshError ? (
        <p className="pbc-alert pbc-alert--danger">{error ?? quote.jobberSnapshotRefreshError}</p>
      ) : null}
      {quote.jobberSnapshotChangeStatus === 'changed' ? (
        <div className="pbc-alert pbc-alert--warning">
          <div>
            <b>Jobber changed since the previous snapshot.</b>
            <ul className="mt-2 space-y-1">
              {quote.jobberSnapshotChangeSummary.map((item, index) => (
                <li key={`${item.field}-${index}`}>{item.label}: {item.before} -> {item.after}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  )
}
```

If `Icons.refresh` does not exist, add it to `components/ui/icons.tsx` using the existing icon pattern.

- [ ] **Step 3: Render panel in detail view**

Inside the Jobber Data card:

```tsx
<SectionLabel icon={Icons.template({ size: 16 })}>Jobber Data</SectionLabel>
<JobberRefreshPanel quote={quote} />
<JobberQuoteSummary quote={quote.jobberSnapshot} />
```

- [ ] **Step 4: Run UI tests**

Run:

```powershell
npm.cmd run test:run -- tests/quote-ui.test.tsx
```

Expected: all tests pass.

---

## Task 5: Jobber Option Candidate Detection

**Files:**
- Create: `components/quote-form/jobber-option-mapping.ts`
- Modify: `components/quote-form/types.ts`
- Modify: `components/quote-form/quote-draft.ts`
- Test: `tests/jobber-option-mapping.test.ts`

- [ ] **Step 1: Extend UI state type**

Add optional field:

```ts
sourceJobberLineItemIds?: string[]
```

to `QuoteOptionItem`.

- [ ] **Step 2: Write failing mapping tests**

Cover:
- text heading `Option 1` groups following priced lines
- next option heading starts a new group
- priced line named `Optional garage repaint` becomes one candidate
- ordinary public line `Interior painting` is not a candidate
- text-only candidate without priced lines is ignored
- converted option has `selectedMin: 1`, `selectedMax: 1`, custom material rows, zero labour, and source Jobber IDs

- [ ] **Step 3: Implement candidate helper**

Create:

```ts
import type { JobberQuoteDraftLineItem } from '@/lib/jobber/mapper'
import type { MaterialItem, QuoteOptionItem } from './types'

export interface JobberOptionImportCandidate {
  id: string
  title: string
  sourceLineIds: string[]
  lines: JobberQuoteDraftLineItem[]
  total: number
}

const OPTION_PATTERN = /\b(option|optional|alternate|alternative|add[-\s]?on|addon)\b/i

export function buildJobberOptionImportCandidates(lines: JobberQuoteDraftLineItem[]): JobberOptionImportCandidate[] {
  const candidates: JobberOptionImportCandidate[] = []
  let current: { title: string; headingId: string; lines: JobberQuoteDraftLineItem[] } | null = null

  function flushCurrent() {
    if (!current || current.lines.length === 0) return
    const sourceLineIds = [current.headingId, ...current.lines.map((line) => line.id)]
    candidates.push({
      id: sourceLineIds.join('|'),
      title: current.title,
      sourceLineIds,
      lines: current.lines,
      total: current.lines.reduce((sum, line) => sum + line.totalPrice, 0),
    })
  }

  for (const line of lines) {
    const titleText = `${line.name} ${line.description}`.trim()
    const isOptionHeading = line.textOnly === true && OPTION_PATTERN.test(titleText)
    if (isOptionHeading) {
      flushCurrent()
      current = { title: line.name.trim() || 'Jobber option', headingId: line.id, lines: [] }
      continue
    }

    const isPriced = line.textOnly !== true && line.totalPrice > 0
    if (current && isPriced) {
      current.lines.push(line)
      continue
    }

    if (isPriced && OPTION_PATTERN.test(line.name)) {
      candidates.push({
        id: line.id,
        title: line.name,
        sourceLineIds: [line.id],
        lines: [line],
        total: line.totalPrice,
      })
    }
  }

  flushCurrent()
  return candidates
}
```

Also implement:

```ts
export function convertJobberOptionCandidateToQuoteOption(
  candidate: JobberOptionImportCandidate,
  createId: (prefix: string) => string
): QuoteOptionItem {
  return {
    id: createId('option'),
    title: candidate.title,
    selectedMin: 1,
    selectedMax: 1,
    isExpanded: true,
    sourceJobberLineItemIds: candidate.sourceLineIds,
    materials: candidate.lines.map((line, index): MaterialItem => ({
      id: createId('option-item'),
      name: line.name || `Jobber option line ${index + 1}`,
      marketPrice: line.totalPrice.toFixed(2),
      actualPrice: line.totalPrice.toFixed(2),
      quantity: '1',
      workingDays: '0',
      labourPerDay: '0',
      isCustom: true,
    })),
  }
}
```

- [ ] **Step 4: Keep draft parser compatible**

In `quote-draft.ts`, parse optional `sourceJobberLineItemIds` as a string array. If missing, default to `undefined`.

- [ ] **Step 5: Run mapping tests**

Run:

```powershell
npm.cmd run test:run -- tests/jobber-option-mapping.test.ts tests/quote-draft.test.ts
```

Expected: all tests pass.

---

## Task 6: Option Import Preview UI

**Files:**
- Create: `components/quote-form/jobber-option-import.tsx`
- Modify: `components/quote-form/quote-form.tsx`
- Modify: `components/quote-form/quote-save-payload.ts`
- Test: `tests/quote-ui.test.tsx`

- [ ] **Step 1: Write failing UI tests**

Cover:
- quote form shows option import preview when Jobber snapshot has option candidates
- ordinary Jobber line items do not render import candidates
- clicking import adds a PBC option with expected title and material amount
- importing the same candidate twice is disabled/prevented
- save payload does not include `sourceJobberLineItemIds`

- [ ] **Step 2: Create preview component**

Create:

```tsx
import Decimal from 'decimal.js'
import type { JobberOptionImportCandidate } from './jobber-option-mapping'

interface JobberOptionImportProps {
  candidates: JobberOptionImportCandidate[]
  importedSourceIds: Set<string>
  onImportCandidate: (candidate: JobberOptionImportCandidate) => void
}

export function JobberOptionImport({ candidates, importedSourceIds, onImportCandidate }: JobberOptionImportProps) {
  const visibleCandidates = candidates.filter((candidate) => candidate.lines.length > 0)
  if (visibleCandidates.length === 0) return null

  return (
    <section className="mt-6 space-y-3 border-t border-[var(--border-soft)] pt-6">
      <div className="pbc-panelhead">
        <div className="pbc-panelhead__copy">
          <h2 className="pbc-paneltitle">Jobber option import</h2>
          <p className="pbc-panelsub">Review detected Jobber option lines before adding them to PBC options.</p>
        </div>
      </div>
      <div className="space-y-2">
        {visibleCandidates.map((candidate) => {
          const alreadyImported = candidate.sourceLineIds.some((id) => importedSourceIds.has(id))
          return (
            <div key={candidate.id} className="pbc-softpanel flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="pbc-titletext">{candidate.title}</p>
                <p className="pbc-listitem__meta">
                  {candidate.lines.length} Jobber lines | ${new Decimal(candidate.total).toFixed(2)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onImportCandidate(candidate)}
                disabled={alreadyImported}
                className="pbc-btn pbc-btn--ghost pbc-btn--sm"
              >
                {alreadyImported ? 'Imported' : 'Import as option'}
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Wire into quote form**

In `quote-form.tsx`, compute:

```ts
const jobberOptionCandidates = useMemo(
  () => buildJobberOptionImportCandidates(jobberQuoteDraft?.productsAndServices ?? []),
  [jobberQuoteDraft]
)

const importedJobberOptionSourceIds = useMemo(() => new Set(
  options.flatMap((option) => option.sourceJobberLineItemIds ?? [])
), [options])
```

Add handler:

```ts
function importJobberOptionCandidate(candidate: JobberOptionImportCandidate) {
  setOptions((current) => {
    const importedIds = new Set(current.flatMap((option) => option.sourceJobberLineItemIds ?? []))
    if (candidate.sourceLineIds.some((id) => importedIds.has(id))) return current
    return [
      ...current,
      convertJobberOptionCandidateToQuoteOption(candidate, createClientId),
    ]
  })
}
```

Render before `QuoteOptionsPanel`:

```tsx
<JobberOptionImport
  candidates={jobberOptionCandidates}
  importedSourceIds={importedJobberOptionSourceIds}
  onImportCandidate={importJobberOptionCandidate}
/>
```

- [ ] **Step 4: Confirm payload ignores UI-only metadata**

In `quote-save-payload.ts`, option payload should continue to map only:

```ts
title
selectedMin
selectedMax
position
items
```

Add a regression test that input `QuoteOptionItem` with `sourceJobberLineItemIds` does not include that field in `payload.options`.

- [ ] **Step 5: Run UI tests**

Run:

```powershell
npm.cmd run test:run -- tests/quote-ui.test.tsx tests/jobber-option-mapping.test.ts
```

Expected: all tests pass.

---

## Task 7: Documentation And Final Verification

**Files:**
- Modify: `PROGRESS.md`
- Modify: `TODOS.md`
- Modify: `docs/DECISIONS.md`
- Modify: `docs/ARCHITECTURE.md`

- [ ] **Step 1: Update docs**

Document:
- Jobber manual refresh implemented.
- Last refresh timestamp is stored separately from write-back sync timestamp.
- Refresh-based change alert implemented.
- Jobber option import is preview/manual confirm, not automatic DB mutation.
- Production Supabase migration `0020` requires explicit user approval before applying.

- [ ] **Step 2: Run full verification**

Run:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test:run
npm.cmd run build
npm.cmd audit --audit-level=high
git diff --check
```

Expected:
- typecheck passes
- lint passes
- tests pass
- build passes
- audit reports 0 high vulnerabilities
- diff check has no whitespace errors; CRLF warnings are acceptable if consistent with existing repo behavior

- [ ] **Step 3: Browser smoke**

With local dev server running:

```powershell
npm.cmd run dev -- --port 3000
```

Check:
- `/quotes/[id]` displays Jobber Data refresh controls for a saved Jobber quote.
- refresh button shows pending state and updates the last refreshed time after success.
- changed Jobber snapshot shows warning alert.
- `/quotes/[id]/edit` shows Jobber option import candidates only when matching option lines exist.
- imported candidate appears in PBC Options and can be saved through the existing quote update flow.

---

## Execution Notes

- Do not apply the production Supabase migration during implementation without explicit user approval.
- Do not add external dependencies.
- Do not change Jobber write-back mutation scope.
- Do not auto-import Jobber option candidates on refresh or fetch; user confirmation is required.
- Do not sync PBC options back to Jobber as a separate Jobber option model in this scope.

