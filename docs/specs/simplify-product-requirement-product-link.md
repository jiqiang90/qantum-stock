# Simplify Product Requirement Product Link

## Metadata

- Status: implemented
- Approved: Yes, by the user in this task
- Iterations: 1
- Last updated: 2026-10-13
- Repo: passivefire
- Domain: material-readiness
- Spec location: `docs/specs/simplify-product-requirement-product-link.md`

## Summary

Remove the synthetic `solution_products` association and let each option-owned
`product_requirements` row reference its `products` row directly. Product
Requirement names, option ownership, quantities, ordering, missing-evidence
semantics, selected-Solution behavior, and user-visible readiness behavior stay
unchanged.

## Scope

In scope:

- Add a forward-only database migration that backfills
  `product_requirements.product_id` from the existing association, replaces the
  relevant constraints and index, removes association-only triggers/functions,
  and drops `solution_products`.
- Update deterministic seed data, generated database types, Supabase repository
  queries, database tests, unit tests, and architecture/product documentation.
- Preserve all current Product Requirement rows, quantities, descriptions,
  option ownership, and unresolved requirements.

Out of scope:

- Renaming `ProductRequirement` or `SolutionOption`.
- Moving Product Requirements from Solution Options to Solutions.
- Changing authentication, Solution selection, Readiness rules, inventory
  semantics, or UI behavior.

## Deferred Ideas

- A production-managed Solution bill of materials or approval model remains a
  separate future capability if real operational evidence requires it.

## Success Criteria

- Final schema has no `solution_products` table or
  `product_requirements.solution_product_id` column.
- Each resolved Product Requirement references `products.id` directly, while an
  unresolved requirement may keep `product_id` and `required_quantity` null.
- An option cannot contain duplicate resolved requirements for the same Product.
- Existing readiness, Product usage, Solution preview, selection, and combined
  availability behavior remain covered and passing.

## Assumptions and Constraints

- Product Requirements remain owned by Solution Options. Validated by the user.
- Existing persisted Product Requirement data must be losslessly backfilled
  before the association table is dropped.
- The user's unrelated `.env.example` modification must remain untouched.
- The migration must work both on the deployed schema and during a clean local
  reset that replays all historical migrations.

## Cross-Repo Touchpoints

- None. Database, application, tests, and documentation are contained in this
  repository.

## Local Recon

- Entry points checked: readiness and Product Supabase repositories, database
  migrations, seed paths, pgTAP tests, generated database types.
- Existing patterns found: option-owned requirements, nullable missing evidence,
  deterministic latest-snapshot selection, forward-only migrations.
- Relevant docs: architecture overview, glossary, Product Explorer, Material
  Readiness, Product overview, Solution Selection.
- Remaining questions: none after the user clarified ownership.

## Approach

- Introduce `product_id` alongside the old association ID, backfill it, then
  replace constraints before dropping obsolete objects.
- Change PostgREST select shapes to traverse the direct Product Requirement FK.
- Keep application domain models unchanged because they already expose Product
  evidence rather than the association record.
- Replace association-specific database assertions with direct-FK, nullable
  evidence, uniqueness, RLS, and behavior checks.

## Tasks

1. Migrate and reseed the database
   - Files: `supabase/migrations/*`, `supabase/seed.sql`,
     `supabase/seeds/02_product_requirements.sql`
   - Action: backfill the direct Product FK, remove association objects, and
     preserve all requirement data.
   - Verify: reset/lint pgTAP schema and scenario tests.
   - Done: clean reset produces the simplified schema and expected seeded rows.
2. Update application persistence adapters
   - Files: Supabase database types and Product/Readiness repositories.
   - Action: replace nested association queries and mapping with direct Product
     relationships.
   - Verify: targeted repository unit tests and typecheck.
   - Done: readiness and reverse Product usage map the same domain evidence.
3. Update database and unit coverage
   - Files: `supabase/tests/*`, repository tests.
   - Action: remove obsolete assertions and cover the direct FK, duplicate
     rejection, missing evidence, permissions, and selection behavior.
   - Verify: unit suite, coverage gate, and pgTAP suite.
   - Done: tests would fail if the association returned or the direct FK broke.
4. Reconcile documentation
   - Files: architecture, glossary, Product Explorer, Material Readiness, product
     overview.
   - Action: remove `SolutionProduct` from the implemented model without
     changing Product Requirement terminology.
   - Verify: repository search and documentation consistency review.
   - Done: all current-state documentation describes the direct relationship.

## Test Strategy

- Unit: repository query-result mapping for resolved/unresolved requirements and
  selected-option Product usage.
- Integration: pgTAP final-schema, FK, check, uniqueness, RLS, seed, Readiness,
  and Solution-selection assertions against a real local Postgres boundary.
- E2E: existing anonymous preview and authenticated Solution-selection journeys.
- Coverage target: retain the repository's enforced full-source thresholds.

## Definition of Done

### Feature Criteria

- The direct Product Requirement to Product relationship is the only persisted
  relationship used for readiness and Product usage.
- No Product Requirement data is lost during migration.
- All existing observable journeys remain functional.

### Completion Checklist

- [x] Unit tests updated with resolved, unresolved, and ordering coverage
- [x] Database migration/reset and pgTAP tests pass
- [x] Full repository quality gate passes
- [x] Browser journeys pass
- [x] Code quality and security boundary reviewed
- [x] Current-state documentation updated
- [x] MCP/OpenAPI changes marked N/A because neither surface exists here
- [x] Demo seed data updated without changing unrelated quantities

## Risks and Mitigations

- Risk: dropping the association before backfill loses Product identity.
  Mitigation: add/backfill/validate `product_id` before removing old objects.
- Risk: PostgREST relationship names change and silently empty nested data.
  Mitigation: update explicit FK-qualified selects and repository mapping tests,
  then run real database and browser tests.
- Risk: permissions drift when a table disappears.
  Mitigation: update pgTAP privilege and RLS table inventories.

## Rollback

- Revert application changes and apply a compensating migration that recreates
  the association from distinct Product Requirement option/Solution/Product
  relationships. Do not roll back deployed migration history destructively.

## Security Considerations

- Public read and authenticated write boundaries remain unchanged.
- Removing a read-only association table reduces the exposed schema surface.
- Direct table mutations remain denied; the existing constrained selection RPC
  remains the only authenticated write.

## Runtime Environment

- Start: `npm run db:start`, `npm run db:reset`, `npm run dev`
- Env vars: existing Supabase URL and publishable key; local E2E credentials only
  for authenticated browser coverage.
- Tests: `npm run check`, `npm run db:test`, production Playwright journey.

## References

- `docs/architecture/overview.md`
- `docs/specs/material-readiness.md`
- `docs/specs/solution-selection.md`
