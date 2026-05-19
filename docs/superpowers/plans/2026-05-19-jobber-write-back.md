# Jobber Quote Write-Back Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let PBC edit Jobber-style Product / Service line items inside `/quotes/new`, save full internal quote data locally, and write approved public line items back to the same Jobber quote without exposing material costs.

**Architecture:** Keep local quote/material calculation as the source of internal pricing truth. Add a separate Jobber public line item model, a narrow Jobber write client with mutation allowlisting, and a sync status layer so local saves survive external API failures.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Supabase Postgres/RLS, Jobber GraphQL, Zod, decimal.js, Vitest.

---

## File Map

- Modify `docs/DECISIONS.md`: change Jobber model from permanent read-only to controlled quote write-back.
- Modify `docs/ARCHITECTURE.md`: update data flow, external API boundary, and Jobber failure handling.
- Modify `docs/SECURITY.md`: add write-scope and mutation allowlist policy.
- Modify `docs/DB-SCHEMA.md`: document planned `jobber_quote_lines` and quote sync fields.
- Modify `docs/UI-QUOTE-FORM.md`: document Jobber Product / Service editor.
- Create `supabase/migrations/0010_add_jobber_quote_lines.sql`: persist public Jobber line items and sync status.
- Modify `lib/validators.ts`: add `jobberQuoteLineSchema` and `jobberSaveMode`.
- Create `lib/jobber/quote-line-payload.ts`: pure mapper from local public Jobber lines to Jobber mutation input.
- Modify `lib/jobber/client.ts`: split read query execution from approved write execution.
- Modify `lib/jobber/config.ts`: replace read-only scope assertion with narrow write-scope policy.
- Create `app/api/jobber/products/route.ts`: search Jobber ProductOrService catalog.
- Create `app/api/jobber/quote/[quoteId]/sync/route.ts`: external Jobber write-back Route Handler, matching existing Jobber API boundary.
- Modify `lib/actions/quotes.ts`: save `jobber_quote_lines`, save sync status, preserve local save on Jobber failure.
- Create `components/quote-form/jobber-product-service-editor.tsx`: Jobber-like editor with Add Line Item and Add Text.
- Modify `components/quote-form/quote-form.tsx`: own editor state, draft persistence, save payload.
- Modify `components/quote-form/quote-draft.ts`: persist editor state locally.
- Modify `components/quote-form/types.ts`: add `JobberQuoteLineItemDraft`.
- Add tests:
  - `tests/jobber-quote-line-payload.test.ts`
  - `tests/jobber-write-client.test.ts`
  - `tests/jobber-products-route.test.ts`
  - `tests/quote-actions-jobber-lines.test.ts`
  - update `tests/jobber-readonly-regression.test.ts`
  - update `tests/jobber-route-security.test.ts`

---

## Task 0: Confirm Jobber GraphQL Schema

- [ ] Open Jobber Developer Center GraphiQL for the connected PBC app.
- [ ] Confirm ProductOrService query name, searchable fields, and pagination shape.
- [ ] Confirm quote line item mutation name and whether quote line items are replaced as a full set or edited individually.
- [ ] Confirm whether Jobber supports public text blocks through API. If not, use zero-price line items for `Add Text`.
- [ ] Confirm tax input behavior. Default implementation assumes Jobber calculates GST from quote tax settings.
- [ ] Record the confirmed mutation/query names at the top of `lib/jobber/client.ts` when implementing.

Expected result: exact Jobber schema names are known before code is written.

---

## Task 1: Write Payload Builder Tests First

**Files:**
- Create `tests/jobber-quote-line-payload.test.ts`
- Create `lib/jobber/quote-line-payload.ts`

- [ ] Add failing tests for `priced_line_items`.
- [ ] Add a regression assertion that serialized payload does not contain internal material values.
- [ ] Add failing tests for `description_total`.
- [ ] Implement `buildJobberQuoteLinePayload(input)` using `decimal.js`.

Required assertions:

```ts
expect(JSON.stringify(payload)).not.toContain('actualPrice')
expect(JSON.stringify(payload)).not.toContain('marketPrice')
expect(JSON.stringify(payload)).not.toContain('Dulux material cost')
expect(payload.lineItems.at(-1)).toMatchObject({
  name: 'Total',
  quantity: 1,
  unitPrice: 3145.30,
  taxable: true,
})
```

Acceptance: `npm.cmd run test:run -- tests/jobber-quote-line-payload.test.ts` passes.

---

## Task 2: Add Database Persistence

**Files:**
- Create `supabase/migrations/0010_add_jobber_quote_lines.sql`
- Modify `docs/DB-SCHEMA.md`
- Modify `tests/rls.test.ts`

- [ ] Write migration for `jobber_quote_lines`.
- [ ] Add quote sync columns to `quotes`.
- [ ] Enable RLS on `jobber_quote_lines`.
- [ ] Add authenticated ALL policy matching existing app table policy.
- [ ] Update `tests/rls.test.ts` table list to include `jobber_quote_lines`.

Acceptance: RLS static test includes the new table and migration order.

---

## Task 3: Extend Validators And Types

**Files:**
- Modify `lib/validators.ts`
- Modify `components/quote-form/types.ts`
- Modify `components/quote-form/quote-draft.ts`

- [ ] Add `jobberSaveModeSchema = z.enum(['priced_line_items','description_total'])`.
- [ ] Add `jobberQuoteLineSchema` with `kind`, `name`, `description`, `quantity`, `unitPrice`, `taxable`, `clientVisible`, `linkedProductOrServiceId`, and `position`.
- [ ] Add `jobberQuoteLines` and `jobberSaveMode` to `quoteSchema`.
- [ ] Add TypeScript UI draft type matching the schema.
- [ ] Update local draft parse/restore so Jobber line items survive refresh.

Acceptance: typecheck passes and quote draft tests are updated.

---

## Task 4: Replace Read-Only Guard With Narrow Write Guard

**Files:**
- Modify `lib/jobber/client.ts`
- Modify `lib/jobber/config.ts`
- Modify `tests/jobber-readonly-regression.test.ts`
- Modify `tests/jobber-route-security.test.ts`
- Create `tests/jobber-write-client.test.ts`

- [ ] Keep query execution centralized in `lib/jobber/client.ts`.
- [ ] Add an approved write function for the confirmed quote line item mutation only.
- [ ] Reject raw mutation strings outside the approved function.
- [ ] Update scope validation to allow only required quote write scope and existing read scopes.
- [ ] Reject broad `manage`, `delete`, unrelated write scopes.
- [ ] Rename read-only regression tests to narrow-write regression tests.

Acceptance: tests prove only approved quote line item write-back is possible.

---

## Task 5: Add Jobber Product / Service Search

**Files:**
- Create `app/api/jobber/products/route.ts`
- Modify `lib/jobber/client.ts`
- Add `tests/jobber-products-route.test.ts`

- [ ] Add a ProductOrService search query using the schema confirmed in Task 0.
- [ ] Return normalized records with `id`, `name`, `description`, `defaultUnitCost`, `taxable`, and `category`.
- [ ] Reuse existing Jobber token refresh behavior.
- [ ] Limit results to 20.

Acceptance: route test covers success, unauthenticated user, and Jobber API error.

---

## Task 6: Build Jobber Product / Service Editor UI

**Files:**
- Create `components/quote-form/jobber-product-service-editor.tsx`
- Modify `components/quote-form/quote-form.tsx`
- Modify `components/quote-form/types.ts`

- [ ] Render a `Product / Service` section below customer info and above internal materials.
- [ ] Add segmented save mode control: `Priced Line Items` and `Description + Total`.
- [ ] Add `Add Line Item` button.
- [ ] Add `Add Text` button.
- [ ] Add editable row fields matching the design doc.
- [ ] Use Jobber product search when linking a line item.
- [ ] Do not include Build Option Set, image upload, or notes UI.

Acceptance: UI tests or render tests verify both line kinds and mode labels are present.

---

## Task 7: Save Local Quote And Jobber Lines

**Files:**
- Modify `lib/actions/quotes.ts`
- Modify `lib/quote-query-shape.ts`
- Modify `lib/dev-data.ts`
- Add `tests/quote-actions-jobber-lines.test.ts`

- [ ] Persist `jobber_quote_lines` with the quote.
- [ ] Read quote details with saved Jobber lines.
- [ ] On update, replace saved Jobber lines transactionally with the new ordered set.
- [ ] Store `jobber_save_mode`.
- [ ] Keep material persistence unchanged.

Acceptance: quote create/update tests prove material rows and Jobber public lines are stored separately.

---

## Task 8: Implement Jobber Write-Back And Retry State

**Files:**
- Create `app/api/jobber/quote/[quoteId]/sync/route.ts`
- Modify `lib/actions/quotes.ts`
- Modify `components/quote-form/quote-form.tsx`
- Add tests for partial failure.

- [ ] After local save succeeds, call approved Jobber write-back if `jobberQuoteId` exists and Jobber is connected.
- [ ] On Jobber success, set `jobber_sync_status = 'synced'`, `jobber_last_synced_at = now()`, clear error.
- [ ] On Jobber failure, keep local quote saved and set `jobber_sync_status = 'failed'` with error.
- [ ] Show Retry button for failed sync.

Acceptance: failing Jobber mock does not roll back local quote save.

---

## Task 9: Verification

- [ ] Run `npm.cmd run typecheck`.
- [ ] Run `npm.cmd run lint`.
- [ ] Run `npm.cmd run test:run`.
- [ ] Browser QA on `http://localhost:3000/quotes/new`:
  - fetch Jobber quote
  - add priced line item
  - add text line
  - save local quote
  - verify Jobber quote receives public Product / Service line items only
  - verify material prices remain only in our app
- [ ] Update `PROGRESS.md` with final test evidence after implementation.

Acceptance: all automated checks pass and one connected Jobber test quote is manually verified.
