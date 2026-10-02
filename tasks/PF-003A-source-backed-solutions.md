# PF-003A Source-backed Solutions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:subagent-driven-development` or
> `superpowers:executing-plans`, as selected by the human, to implement this
> plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace invented Solution summaries with a bounded twelve-record
Ryanfire catalogue subset while preserving the existing Material Readiness and
aggregate contention journeys.

**Architecture:** Supabase remains the source of truth. The `solutions` table
stores the twelve supplied catalogue fields plus the application UUID, while
Work Packages continue to reference one nominated Solution and synthetic
operational data remains in the existing related tables. A pure presentation
helper derives compact UI labels so persistence does not acquire another
invented name field.

**Tech Stack:** PostgreSQL/Supabase migrations and pgTAP, TypeScript, Next.js 16,
React 19, Vitest/Testing Library, Playwright.

**Spec:** `docs/specs/source-backed-solutions.md`

- Timebox: 75 minutes
- Depends on: PF-003, PF-004, and PF-004A
- Execution method: pending human selection
- Git boundary: implementation remains uncommitted until the human explicitly
  authorizes a commit

## Global Constraints

- Seed exactly the twelve source records listed in the approved spec, preserving
  whitespace, Unicode, punctuation, and `Insulation = "-"` field-for-field.
- Keep `data/solutions-excerpt.csv` ignored and outside runtime and CI.
- Use `(supplier, internal_code)` as source identity and retain
  `supplier_ref_code` separately; keep the UUID as the relational key.
- Do not infer Product mappings from catalogue conditions or claim compliance,
  approval, equivalence, or substitution.
- Only four Solutions receive synthetic Product mappings or Work Packages; the
  other eight are catalogue coverage only.
- Preserve six Work Packages and the aggregate riser result: `10 cartridge`
  required, `8 cartridge` available, `2 cartridge` missing.
- Keep the change inside the modular monolith; add no Solution Explorer, import
  pipeline, authentication, write path, or new dependency.
- Git commit, push, deployment, and provider changes remain excluded until the
  human explicitly authorizes them.

## Review Focus

1. Raw source fidelity: tests must protect `Ø`, `®`, doubled spaces, punctuation,
   and the literal `-` value from normalization.
2. Supplier-scoped identity: a duplicate Internal Code for the same supplier
   must be rejected without making application UUIDs or Supplier Ref. Codes the
   canonical source identity.
3. Catalogue-only records: eight valid Solutions must be allowed to have no
   Product mapping and must not appear as invented Work Packages.
4. Presentation boundaries: derived labels must identify the catalogue record
   without inventing approval language or overwhelming readiness evidence.
5. Regression safety: removing inconsistent Product mappings must preserve the
   six-package status matrix and the `10 / 8 / 2` aggregate contention result.

---

### Task 1: Persist the source-backed catalogue contract

**Files:**

- Modify: `supabase/tests/01_readiness_schema.test.sql`
- Modify: `supabase/tests/03_synthetic_scenarios.test.sql`
- Modify: `supabase/migrations/20261001222720_create_readiness_schema.sql`
- Modify: `supabase/seed.sql`
- Regenerate: `src/lib/supabase/database.types.ts`

**Interfaces:**

- Consumes: the twelve exact records and source/operational boundary in
  `docs/specs/source-backed-solutions.md`.
- Produces: `public.solutions` with `id`, `internal_code`,
  `supplier_ref_code`, `supplier`, `orientation`, `substrate`,
  `service_classification`, `service_type`, `service_size`, `integrity`,
  `insulation`, `service_type_option`, and `substrate_option`.

- [x] **Step 1: Add failing schema tests for the source fields and identity**

  Assert all twelve text fields are required and non-blank, the persisted
  `name` field is absent, and uniqueness is enforced for
  `(supplier, internal_code)`. Retain `supplier_ref_code` as separately
  queryable source evidence without assigning it canonical identity semantics.

- [x] **Step 2: Add failing seed scenario tests**

  Assert exactly twelve Solutions match the approved table field-for-field;
  four have operational mappings; eight have none. Pin the expected corrected
  totals: six Work Packages, five Products, nine SolutionProduct mappings,
  fifteen Product Requirements, and five Inventory Snapshots. Include exact
  assertions for the `-`, doubled-space, `Ø`, and `®` values.

- [x] **Step 3: Run the database tests and confirm the intended failures**

  Run: `npm run db:test`

  Expected: failures reference the missing source columns, the four old
  Solutions, and the old seed totals.

- [x] **Step 4: Expand the Solution schema**

  Replace `solutions.name` with the twelve source text columns, non-blank checks,
  and the supplier-scoped Internal Code unique constraint. Do not add normalized
  aliases, JSON source blobs, approval state, or import metadata.

- [x] **Step 5: Correct and expand the seed**

  Seed the twelve approved records. Map the existing six Work Packages to
  Solutions `0444`, `0485`, `0659`, and `0510`; rename `Level 3 ceiling
services` to `Level 3 ceiling conduit penetrations`. Change the collar Product
  from a 100mm to a 40mm identity/variant, remove its mapping and requirements
  from Solution `0485`, and remove the cable-pillow Product, mapping, requirement,
  and Inventory Snapshot from Solution `0510`. Preserve the deterministic
  sealant tie-break snapshots and the first two riser quantities.

- [x] **Step 6: Recreate the database and regenerate TypeScript types**

  Run: `npm run db:reset && npm run db:types`

  Expected: reset succeeds and generated `Database["public"]["Tables"]["solutions"]`
  exposes the twelve source fields without `name`.

- [x] **Step 7: Run focused database verification**

  Run: `npm run db:test && supabase db lint --local --level warning`

  Expected: every pgTAP assertion passes and schema lint reports no warnings or
  errors.

### Task 2: Carry Solution evidence through the readiness boundary

**Files:**

- Modify: `src/modules/readiness/readiness-model.ts`
- Modify: `src/modules/readiness/supabase-readiness-repository.ts`
- Modify: `src/modules/readiness/supabase-readiness-repository.test.ts`
- Modify: `src/modules/readiness/readiness-service.test.ts`
- Review: `src/modules/product/supabase-product-repository.ts`
- Modify if its fixture shape requires it:
  `src/modules/product/supabase-product-repository.test.ts`

**Interfaces:**

- Consumes: the Task 1 `solutions` row contract.
- Produces: `SolutionReference` with camel-case equivalents of all twelve source
  fields plus `id`; `WorkPackageEvidence.solution` remains non-null.

- [x] **Step 1: Write failing repository mapping tests**

  Use Solution `0375` fixture values to prove `serviceType` preserves
  `Copper Pipe  - 50mm Fibreglass`, and use Solution `0334` to prove
  `insulation` preserves `-`. Assert all remaining source fields are mapped with
  the exact camel-case names in the produced interface.

- [x] **Step 2: Run the focused adapter tests and confirm failure**

  Run:
  `npm test -- src/modules/readiness/supabase-readiness-repository.test.ts`

  Expected: the tests fail because `SolutionReference` and the Supabase select
  still expose only `id` and `name`.

- [x] **Step 3: Replace the Solution boundary and adapter mapping**

  Define the exact source-backed `SolutionReference`, select the twelve Solution
  columns in `WORK_PACKAGE_SELECT`, and map snake_case database rows into the
  camel-case interface without trimming or parsing raw values.

- [x] **Step 4: Update dependent service and Product fixtures**

  Replace invented Solution names in test builders with complete source-backed
  fixtures. Keep Product reverse usage based on existing SolutionProduct and
  Work Package relationships; do not add catalogue-only Solutions to Product
  responses.

- [x] **Step 5: Run module tests**

  Run: `npm test -- src/modules/readiness src/modules/product`

  Expected: all readiness and Product module tests pass.

### Task 3: Derive concise Solution presentation

**Files:**

- Create: `src/modules/readiness/solution-display.ts`
- Create: `src/modules/readiness/solution-display.test.ts`
- Modify: `src/modules/readiness/work-package-list.tsx`
- Modify: `src/modules/readiness/work-package-detail.tsx`
- Modify: `src/modules/readiness/readiness-components.test.tsx`
- Modify: `e2e/aggregate-readiness.spec.ts`

**Interfaces:**

- Consumes: `SolutionReference` from Task 2.
- Produces:
  `formatSolutionLabel(solution: SolutionReference): string` and
  `formatFireResistance(solution: SolutionReference): string`.

- [x] **Step 1: Write failing pure presentation tests**

  Assert Solution `0444` formats as
  `Ryanfire 0444 · PVC Pipe Ø40mm · Plasterboard Wall · 60/60`; assert a
  literal `-` insulation formats as `60/-`; assert raw fields are unchanged.

- [x] **Step 2: Run the focused tests and confirm failure**

  Run: `npm test -- src/modules/readiness/solution-display.test.ts`

  Expected: failure because the formatter module does not exist.

- [x] **Step 3: Implement the two pure formatters**

  Compose the compact label from `supplier`, `internalCode`, `serviceTypeOption`,
  `serviceSize`, `substrateOption`, `integrity`, and `insulation`. Do not parse,
  normalize, or convert the fire-resistance text.

- [x] **Step 4: Update list and detail presentation tests**

  Assert the Work Package table uses the compact label. Assert detail includes
  Internal Code, Supplier Ref. Code, orientation, main service conditions, and
  raw substrate as secondary metadata before the Material evidence section.
  Assert no approval/compliance language is introduced.

- [x] **Step 5: Update the Work Package list and detail components**

  Use the shared formatter for the table. Keep readiness status and Material
  evidence as the detail-page priority; render the source metadata as one compact
  definition list rather than another card or warning banner.

- [x] **Step 6: Protect the aggregate browser journey**

  Extend the existing Playwright journey to assert the corrected Solution label
  and renamed ceiling Work Package while preserving the sealant `10 / 8 / 2`
  aggregate result.

- [x] **Step 7: Run focused UI verification**

  Run:
  `npm test -- src/modules/readiness/solution-display.test.ts src/modules/readiness/readiness-components.test.tsx && npm run test:e2e -- e2e/aggregate-readiness.spec.ts`

  Expected: unit/component tests and the browser journey pass.

### Task 4: Reconcile documentation and run the complete gate

**Files:**

- Modify: `README.md`
- Modify: `AGENTS.md`
- Modify: `docs/product/overview.md`
- Modify: `docs/specs/material-readiness.md`
- Modify: `docs/specs/product-explorer.md`
- Modify: `docs/architecture/overview.md`
- Modify: `docs/engineering/agent-approach.md`
- Modify: `docs/glossary.md`
- Modify: `docs/quality/test-strategy.md`
- Modify: `tasks/PF-003-local-supabase.md`
- Modify: `tasks/PF-004-readiness-experience.md`
- Modify: `tasks/PF-004A-product-explorer.md`
- Modify: `tasks/BOARD.md`

**Interfaces:**

- Consumes: verified schema, seed counts, UI copy, and automated evidence from
  Tasks 1–3.
- Produces: one self-consistent description of source-backed Solution fields
  and synthetic operational assumptions across stable docs and task evidence.

- [x] **Step 1: Update stable documentation**

  Replace the four invented Solution/name model with the approved twelve-field
  source model. State that only four source Solutions are nominated by six Work
  Packages; eight remain catalogue-only. Remove claims that all Solutions are
  synthetic or that every Solution must own a Product mapping. Keep the ignored
  CSV/non-runtime boundary and explicitly retain synthetic Product mappings,
  quantities, Work Packages, and inventory.

- [x] **Step 2: Reconcile historical task records without rewriting history**

  Add a dated superseding note to PF-003 for the later source-backed correction;
  update PF-004/PF-004A scenario names and verified counts only where current
  evidence changes. Mark PF-003A `Verify` before the complete gate and `Done`
  only after every required check passes.

- [x] **Step 3: Run the full automated gate**

  Run:
  `npm run db:reset && npm run db:test && supabase db lint --local --level warning && npm run check && npm run test:e2e`

  Expected: database reset, all pgTAP checks, schema lint, formatting, ESLint,
  TypeScript, Vitest, production build, and all Playwright journeys pass.

- [ ] **Step 4: Review rendered responsive behavior**

  Inspect Work Package list/detail at desktop and narrow mobile widths. Confirm
  the compact label wraps without horizontal overflow, detail metadata remains
  subordinate to readiness, and catalogue-only records create no dead UI.
  Record this as human/manual evidence unless the human explicitly asks the AI
  to operate the browser.

- [x] **Step 5: Record final evidence and remaining gaps**

  Update PF-003A with exact test totals and any unresolved gap. Do not claim
  commit, push, deployment, or public-runtime proof unless separately authorized
  and actually verified.

## Implementation evidence — 2026-10-02

- RED: the initial pgTAP run failed because the existing `solutions` table had
  only `id` and invented `name`; the focused adapter test then failed because
  source fields were still returned in database snake case; presentation tests
  failed because list/detail components still consumed `solution.name`.
- The local database was deliberately reset from the corrected existing
  migration and seed. No data migration, backfill, CSV import pipeline, or
  compatibility layer was introduced.
- The reset seed contains 12 source-backed Solutions, 6 synthetic Work Packages,
  5 synthetic Products, 9 synthetic SolutionProduct mappings, 15 Product
  Requirements, and 5 Inventory Snapshots. Four Solutions support the active
  journey and eight remain catalogue coverage only.
- `npm run db:test` passed 78 pgTAP assertions across 3 files.
  `supabase db lint --local --level warning` reported no schema errors.
- `npm run check` passed formatting, ESLint, TypeScript, 71 Vitest tests across
  10 files, and the production Next.js build.
- Both Playwright journeys passed against the installed system Chrome. The
  aggregate journey verifies the source-backed `0444` label, renamed ceiling
  Work Package, and unchanged `10 / 8 / 2` shared-sealant shortage.
- Git commit/push, CI execution, deployment, and public-runtime proof were not
  performed or inferred.

## Remaining verification

- [ ] Human review at desktop and narrow/mobile widths: confirm long Solution
      labels wrap without horizontal overflow and the Solution metadata remains
      visually subordinate to Material Readiness evidence.
