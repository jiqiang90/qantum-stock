# PF-003: Local Supabase Foundation

- Timebox: 60 minutes
- Depends on: PF-002 and a running Docker-compatible runtime

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
`product_requirements`, and `inventory_snapshots`. One Sample Work Package has
one nominated synthetic Solution. A Product has a unique synthetic Product Code,
a specific name, and one canonical unit; requirement and inventory quantities do
not repeat the unit. Nullable Product mapping or required quantity and an absent
snapshot preserve `UNKNOWN` evidence. Do not add a Product Category table.

Do not add Auth, write RPCs, persisted summaries, `sample_data` columns, or an
unused provenance field.

## Acceptance criteria

- [x] `npm run db:start` starts the local stack and `npm run db:reset` succeeds
      from migrations plus seed.
- [x] Seed data contains nine Sample Work Packages covering readiness
      boundaries, missing evidence, and status precedence.
- [x] Synthetic records do not copy supplied catalogue rows or reuse Solution
      identifiers as Product IDs or Product Codes.
- [x] Every Product has a unique non-empty Product Code, a specific Product name,
      and a non-empty canonical unit; dependent quantities have no separate unit
      or conversion fields.
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
- [x] Add nine deterministic Sample Work Packages and related synthetic data.
- [x] Reset from zero, run database tests, and inspect data once in Studio.
- [x] Generate TypeScript database types and run `npm run check`.

## Stop condition

If reset, seed, public read, and denied mutations are not repeatable by the end
of the timebox, resolve the environment instead of introducing a JSON fallback.

## Verification and evidence

### Automated evidence — 2026-10-02

- Docker 27.4.0 was available. Supabase CLI 2.119.0 is an exact project-level
  development dependency; no global CLI is assumed.
- Before the migration, the schema and permission suite failed because the five
  required tables did not exist. After the migration, those tests passed while
  the empty-seed scenario suite failed 5 of 7 assertions. Adding the synthetic
  seed turned the complete pgTAP suite green: 3 files and 31 tests.
- `npm run db:reset` recreated the database from the single migration and seed.
  `npm run db:types` regenerated and formatted the public schema types without
  manual changes. `supabase db lint --local --level warning` found no schema
  errors.
- A Data API probe using the local publishable key returned HTTP 200 and nine
  Work Packages for `SELECT`; `POST`, `PATCH`, and `DELETE` each returned HTTP 401. The database tests also verify `anon` grants and RLS on all five tables.
- `npm audit --audit-level=low` reported zero vulnerabilities. A targeted secret
  scan found policy text only and no key material in the change set.
- `npm run check` passed formatting, ESLint, TypeScript, 12 unit tests, and the
  production build.

### Scenario expansion — 2026-10-02

- The ignored catalogue excerpt was analysed only to select representative
  orientation, service, and substrate contexts. No source row, supplier
  reference, or internal code was copied into the seed.
- Test-first expansion increased the seed to 9 Solutions, 9 Work Packages, 6
  Products, 10 Product Requirements, and 6 Inventory Snapshots. The matrix now
  proves equality, multiple requirements, partial and zero-stock shortages,
  `SHORTAGE` precedence, every specified `UNKNOWN` reason, and an empty Work
  Package.
- The database suite now contains 40 passing pgTAP tests across 3 files.

### Boundary clarification

The local Supabase Auth service remains enabled only because it provides the
standard publishable key consumed by `supabase-js`; account signup is disabled.
No login, user, session, role, or application authorization feature is added.

### Human verification — 2026-10-02

- [x] The human reviewed the expanded Sample Data in local Studio and authorized
      PF-003 close-out and commit.
