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
  `ReadinessReason`, `RequirementAssessment`, and `ReadinessAssessment` in the
  same domain module.

No React, Next.js, Supabase, repository, class hierarchy, or unit conversion is
part of this task.

## Acceptance criteria

- [ ] AC-1 through AC-4 in `docs/specs/material-readiness.md` pass as focused
      domain tests. AC-5 is enforced by the database and presentation data
      contract rather than unit-conversion logic in this module.
- [ ] Package precedence is `SHORTAGE`, then `UNKNOWN`, then `READY`, while every
      requirement assessment and reason is retained.
- [ ] An empty requirement collection results in
      `UNKNOWN / NO_REQUIREMENTS`, never `READY`.
- [ ] Each requirement follows the canonical reason-code decision order in the
      First Slice specification.
- [ ] The module has no React, Next.js, Supabase, persistence, or transport
      dependency.

## Human implementation guide

- [ ] Write failing tests for AC-1 through AC-4, empty requirements, mixed
      shortage/unknown evidence, every canonical reason code, and the applicable cases in
      `docs/quality/test-strategy.md`.
- [ ] Run the focused test and confirm it fails for the missing implementation.
- [ ] Implement the smallest pure readiness calculation that passes the tests.
- [ ] Run the focused test, then `npm run check`.
- [ ] Update capability status and record evidence below.

## Verification and evidence

Not started. Record date, commands, results, and any deviation here; do not paste
complete logs.
