# PF-003: Local Supabase Foundation

- Timebox: 60 minutes
- Depends on: PF-002 and a running Docker-compatible runtime

## Superseding data correction — 2026-10-02

PF-003A replaced the original four invented Solutions with twelve exact records
selected from the supplied catalogue. The current reset produces 12 Solutions,
6 Work Packages, 5 synthetic Products, 9 synthetic SolutionProduct
associations, 15 Product Requirements, and 5 Inventory Snapshots. Four
Solutions support the Work Package journey and eight are catalogue coverage
only. The scenario-expansion evidence below is retained as historical evidence
of the earlier seed rather than rewritten as if it never existed.

## Outcome

One command sequence recreates the read-only local Supabase data model from
versioned migrations and deterministic synthetic seed data.

## Files and interfaces

- Add the project-scoped Supabase CLI plus `db:start`, `db:stop`, `db:reset`, and
  `db:test` scripts.
- Use `@supabase/supabase-js` for the server-side read client; remove
  `@supabase/ssr` unless a concrete cookie/session requirement appears.
- Create `supabase/config.toml`, one readiness migration, `supabase/seed.sql`,
  and focused pgTAP tests.
- Generate `src/lib/supabase/database.types.ts` from the local schema.
- Keep `.env.example` limited to public Supabase variables.

The schema contains `solutions`, `work_packages`, `products`,
`solution_products`, `product_requirements`, and `inventory_snapshots`. One Work
Package has one nominated synthetic Solution, and a Solution may be reused by
multiple Work Packages. `solution_products` is an internal association and does
not store quantities or introduce its own domain workflow. A Product has a
unique synthetic Product Code, specific name, flat
Product Category, Manufacturer, Supplier Product Code, Product Variant,
description, and one canonical unit; requirement and inventory quantities do
not repeat the unit. Nullable Product mapping or required quantity and an absent
snapshot preserve `UNKNOWN` evidence. An unmapped requirement cannot store a
quantity because it has no Product-owned unit. Do not add a Product Category
table or hierarchy.

Do not add Auth, write RPCs, persisted summaries, row-level synthetic-data
columns, or an
unused provenance field.

## Acceptance criteria

- [x] `npm run db:start` starts the local stack and `npm run db:reset` succeeds
      from migrations plus seed.
- [x] Seed data contains six Work Packages, including multi-Product cases,
      covering readiness boundaries, missing evidence, and status precedence.
- [x] Two Solutions are each reused by multiple Work Packages, demonstrating
      the intended `Solution 1:N Work Package` relationship.
- [x] Synthetic records do not copy supplied catalogue rows or reuse Solution
      identifiers as Product IDs or Product Codes.
- [x] Every Product has a unique non-empty Product Code, specific Product name,
      complete synthetic profile, and non-empty canonical unit; dependent
      quantities have no separate unit or conversion fields.
- [x] Required and available quantities cannot be negative; numeric zero remains
      valid.
- [x] Quantity columns use `numeric(12,3)`, matching the domain's
      three-decimal normalization rule.
- [x] Seed Product names identify concrete synthetic products rather than using
      `Fire Collar`, `Fire Sealant`, or a packaging unit as the whole identity.
- [x] Public runtime access can select the required demo data and cannot insert,
      update, or delete it.
- [x] Latest Inventory Snapshot selection is deterministic by
      `captured_at DESC, id DESC` and supported by an index.
- [x] Database types regenerate without manual edits.
- [x] No service-role or hosted secret is committed.

## Execution checklist

- [x] Install/initialize the local Supabase toolchain.
- [x] Write failing schema and permission tests before the migration.
- [x] Add the minimal schema, constraints, index, grants, and read policies.
- [x] Add six deterministic Work Packages and related synthetic data.
- [x] Reset from zero, run database tests, and inspect data once in Studio.
- [x] Generate TypeScript database types and run `npm run check`.

## Stop condition

If reset, seed, public read, and denied mutations are not repeatable by the end
of the timebox, resolve the environment instead of introducing a JSON fallback.

## Verification and evidence

### Automated evidence — 2026-10-02

- Docker 27.4.0 was available. Supabase CLI 2.119.0 is an exact project-level
  development dependency; no global CLI is assumed.
- The schema was developed test-first. The current migration introduces six
  required tables, including the internal `solution_products` association, and
  the complete pgTAP suite passes after a reset: 3 files and 60 tests.
- `npm run db:reset` recreated the database from the single migration and seed.
  `npm run db:types` regenerated and formatted the public schema types without
  manual changes. `supabase db lint --local --level warning` found no schema
  errors.
- The original Data API boundary probe returned HTTP 200 for `SELECT`; `POST`,
  `PATCH`, and `DELETE` each returned HTTP 401. The database tests continue to
  verify `anon` grants and RLS on all six tables after the seed redesign.
- `npm audit --audit-level=low` reported zero vulnerabilities. A targeted secret
  scan found policy text only and no key material in the change set.
- `npm run check` passed formatting, ESLint, TypeScript, 12 unit tests, and the
  production build.

### Scenario expansion — 2026-10-02

- The ignored catalogue excerpt was analysed only to select representative
  orientation, service, and substrate contexts. No source row, supplier
  reference, or internal code was copied into the seed.
- Test-first redesign produces 4 Solutions, 6 Work Packages, 6 Products, 11
  SolutionProduct associations, 18 Product Requirements, and 6 Inventory
  Snapshots. Two Solutions are reused by two Work Packages each, and every Work
  Package contains three Product Requirements.
- The matrix proves all-ready multi-Product evidence, partial and multiple
  shortages, zero stock, `SHORTAGE` precedence over `UNKNOWN`, a missing Product
  mapping, missing required quantity, and missing inventory evidence.
- The database suite now contains 60 passing pgTAP tests across 3 files.
- A rebuilt production runtime rendered 6 Work Packages and 6 Products from the
  reset local database. It showed both reused Solutions, multi-Product
  requirements, known zero stock, and missing Inventory evidence.

### Boundary clarification

The local Supabase Auth service remains enabled only because it provides the
standard publishable key consumed by `supabase-js`; account signup is disabled.
No login, user, session, role, or application authorization feature is added.

### Human verification — 2026-10-02

- [x] The human reviewed the earlier expanded dataset in local Studio and
      authorized PF-003 close-out. The later multi-Product redesign is protected
      by the scenario suite and still requires final visual sign-off.
