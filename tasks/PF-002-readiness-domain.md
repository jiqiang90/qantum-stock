# PF-002: Readiness Domain

- Timebox: 35 minutes
- Depends on: PF-001A

## Outcome

Framework-independent code determines `READY`, `SHORTAGE`, or `UNKNOWN` from
per-requirement evidence.

## Files and interfaces

- Create `src/features/readiness/domain/readiness.ts`.
- Create `src/features/readiness/domain/readiness.test.ts`.
- Produce
  `assessReadiness(requirements: readonly RequirementEvidenceInput[]): ReadinessAssessment`.
- Define `ReadinessStatus`, `RequirementEvidenceInput`,
  `ReadinessReason`, `ProductEvidence`, `InventorySnapshotEvidence`,
  `RequirementAssessment`, and `ReadinessAssessment` in the same domain module.

No React, Next.js, Supabase, repository, class hierarchy, or unit conversion is
part of this task.

## Acceptance criteria

- [x] AC-1 through AC-4 in `docs/specs/material-readiness.md` pass as focused
      domain tests. AC-5 is enforced by the database and presentation data
      contract rather than unit-conversion logic in this module.
- [x] Package precedence is `SHORTAGE`, then `UNKNOWN`, then `READY`, while every
      requirement assessment and reason is retained.
- [x] An empty requirement collection results in
      `UNKNOWN / NO_REQUIREMENTS`, never `READY`.
- [x] Each requirement follows the canonical reason-code decision order in the
      First Slice specification.
- [x] Known Product evidence retains its specific Product name and Product Code.
- [x] The module has no React, Next.js, Supabase, persistence, or transport
      dependency.

## Execution checklist

- [x] Write failing tests for AC-1 through AC-4, empty requirements, mixed
      shortage/unknown evidence, every canonical reason code, and the applicable cases in
      `docs/quality/test-strategy.md`.
- [x] Run the focused test and confirm it fails for the missing implementation.
- [x] Implement the smallest pure readiness calculation that passes the tests.
- [x] Run the focused test, then `npm run check`.
- [x] Update capability status and record evidence below.

## Verification and evidence

Completed on 2026-10-02.

- Red: `npm test -- src/features/readiness/domain/readiness.test.ts` failed as
  expected because `./readiness` did not yet exist.
- Green: the same focused command passed 9 tests covering all canonical reason
  codes, status precedence, evidence retention, decimal quantities, and numeric
  zero.
- Quality gate: `npm run check` passed formatting, lint, type checking, all 10
  repository tests, and the Next.js production build.
- Scope review: both new files are below the 500-line ceiling; the domain module
  has no framework, persistence, transport, or browser dependency.
- Manual evidence: not applicable to this pure domain task.
- Deviations: none.

Contract clarification on 2026-10-02:

- Red: `npm run typecheck` failed after the test fixture required `productCode`,
  because `ProductEvidence` did not yet define it.
- Green: adding the required field to `ProductEvidence` preserved the existing
  readiness behavior; the focused 9 tests and type checking passed.
- A second red/green check proved that an unmapped Product cannot expose orphan
  available quantity or Inventory Snapshot time; the focused suite failed on
  the old behavior and passed after the evidence rule was applied.
- Commit review found that raw JavaScript subtraction could classify equal
  decimal evidence as a tiny shortage. Two focused regression tests failed on
  the old behavior and passed after quantities were normalized to the accepted
  three-decimal scale. The missing-demand case also proves that otherwise-known
  inventory evidence remains visible.
- Final quality gate: `npm run check` passed formatting, lint, type checking,
  all 12 repository tests, and the Next.js production build after review fixes.
