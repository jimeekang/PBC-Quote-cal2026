# Docs Consistency And UI Quick Wins Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align project status documents with implemented work, document that Settings is sufficient for product/service management, and apply small UI/accessibility quick wins without changing quote behavior.

**Architecture:** Keep this as a scoped cleanup: documentation updates first, then CSS/markup-only UI improvements, then verification. Do not introduce new dependencies, DB migrations, production changes, or a separate `/products` page.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Vitest, existing `.pbc-*` CSS classes.

---

### Task 1: Documentation Consistency Cleanup

**Files:**
- Modify: `docs/DECISIONS.md`
- Modify: `PROGRESS.md`
- Modify: `TODOS.md`
- Modify: `README.md`
- Modify if needed: `docs/ARCHITECTURE.md`

- [ ] Remove stale status conflicts where Roof persistence, local draft privacy/expiry, Jobber sync preview/retry, and Duplicate quote appear as future or excluded work.
- [ ] Update `PROGRESS.md` headline progress/status so it no longer says `97%` or `ProductOrService search 잔여`.
- [ ] Keep only genuinely remaining Jobber follow-ups: option line item auto-mapping, webhook/cache refresh, and change detection notification.
- [ ] Record the user decision that no separate `/products` CRUD page is needed because Settings already covers Paint Product and Product & Service management sufficiently.
- [ ] Verify with `rg -n "ProductOrService search 잔여|97%|planned|미적용|/products.*CRUD|견적 복제\\(Duplicate\\).*제외|Roof 공식 선택값 저장.*제외|local draft privacy/expiry.*제외|Jobber sync preview/retry.*제외" -S PROGRESS.md README.md TODOS.md docs`.

### Task 2: UI/UX Quick Wins

**Files:**
- Modify: `app/styles/components.css`
- Modify if needed: `components/quote-form/quote-form.tsx`
- Modify if needed: `components/quote-detail/quote-detail-view.tsx`
- Test if changed: `tests/quote-ui.test.tsx`

- [ ] Improve global focus-visible styling for interactive `.pbc-*` controls without altering layout.
- [ ] Improve low-contrast muted text/button states identified in `docs/UI-UX-REVIEW.md`.
- [ ] Make destructive or risky actions visually clearer using existing button classes, not new dependencies.
- [ ] Improve draft leave dialog accessibility with existing markup patterns: stable dialog labels, clear destructive/secondary actions, and no behavior change.
- [ ] Run `npm.cmd run test:run -- tests/quote-ui.test.tsx` if test-covered UI markup changes.

### Task 3: Final Verification And Progress Update

**Files:**
- Modify: `PROGRESS.md`

- [ ] Add a 2026-06-29 progress entry summarizing the document consistency cleanup and UI/UX quick wins.
- [ ] Run `npm.cmd run typecheck`.
- [ ] Run `npm.cmd run lint`.
- [ ] Run `git diff --check`.
- [ ] Run targeted `rg` stale-status checks from Task 1.
- [ ] Report changed files, verification results, and any remaining follow-up items.
