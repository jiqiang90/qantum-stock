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
one nominated synthetic Solution. A Product owns its canonical unit;
requirement and inventory quantities do not repeat it. Nullable Product mapping
or required quantity and an absent snapshot preserve `UNKNOWN` evidence.

Do not add Auth, write RPCs, persisted summaries, `sample_data` columns, or an
unused provenance field.

## Acceptance criteria

- [ ] `npm run db:start` starts the local stack and `npm run db:reset` succeeds
      from migrations plus seed.
- [ ] Seed data contains three Sample Work Packages covering `READY`,
      `SHORTAGE`, and `UNKNOWN`.
- [ ] Synthetic records do not copy supplied catalogue rows or reuse Solution
      identifiers as Product IDs.
- [ ] Every Product has a non-empty canonical unit; dependent quantities have no
      separate unit or conversion fields.
- [ ] Public runtime access can select the required demo data and cannot insert,
      update, or delete it.
- [ ] Latest Inventory Snapshot selection is deterministic by
      `captured_at DESC, id DESC` and supported by an index.
- [ ] Database types regenerate without manual edits.
- [ ] No service-role or hosted secret is committed.

## Human implementation guide

- [ ] Install/initialize the local Supabase toolchain.
- [ ] Write failing schema and permission tests before the migration.
- [ ] Add the minimal schema, constraints, index, grants, and read policies.
- [ ] Add three deterministic Sample Work Packages and related synthetic data.
- [ ] Reset from zero, run database tests, and inspect data once in Studio.
- [ ] Generate TypeScript database types and run `npm run check`.

## Stop condition

If reset, seed, public read, and denied mutations are not repeatable by the end
of the timebox, resolve the environment instead of introducing a JSON fallback.

## Verification and evidence

Not started. Record date, commands, results, and deviations here.
