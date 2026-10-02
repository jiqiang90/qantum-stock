# PF-002B: Readiness Policy Strategy

- Timebox: 20 minutes
- Depends on: PF-002
- Historical outcome: completed, then superseded by the proportionality review
  recorded in
  [`ADR-004`](../docs/architecture/decisions/ADR-004-simplify-readiness-module.md).
  The evidence below remains the record of what was implemented and verified at
  that time; it is not the current runtime design.

## Outcome

The verified readiness calculation is exposed through a replaceable
`ReadinessPolicy` Strategy without changing any readiness result.

## Files and interfaces

- Define `ReadinessPolicy` in the readiness domain.
- Implement `StandardReadinessPolicy` as the only runtime Strategy.
- Preserve `RequirementEvidenceInput`, `ReadinessAssessment`, and all existing
  reason/status semantics.

Do not add a runtime factory, resolver, customer/project configuration,
reservation evidence, or `ProjectAllocatedReadinessPolicy`. The future business
reason and implementation trigger are recorded in
[`ADR-003`](../docs/architecture/decisions/ADR-003-readiness-policy-strategy.md).

## Acceptance criteria

- [x] `StandardReadinessPolicy` satisfies all existing readiness-domain cases
      without changing outputs.
- [x] Consumers can depend on `ReadinessPolicy` rather than the concrete class.
- [x] No React, Next.js, Supabase, persistence, transport, tenant selection, or
      reservation dependency enters the domain.
- [x] No second production Strategy or placeholder success path is created.
- [x] Existing authored files remain below 500 lines.

## Execution checklist

- [x] Lock the current function behavior with the existing focused suite.
- [x] Refactor behind `ReadinessPolicy` and `StandardReadinessPolicy`.
- [x] Run the focused domain tests, then `npm run check`.
- [x] Update capability status and record evidence below.

## Verification and evidence

Verification started on 2026-10-02.

- Behavior lock: the original focused readiness suite passed all 11 tests before
  the refactor.
- Red: after tests were changed to consume the agreed Strategy API, the focused
  suite failed because `StandardReadinessPolicy` was not a constructor.
- Green: the focused suite passed all 11 existing domain cases through a
  `ReadinessPolicy`-typed `StandardReadinessPolicy` instance.
- Scope: the production domain contains one Strategy contract and one runtime
  implementation. No factory, resolver, tenant/project configuration,
  reservation evidence, test stub, or second production Strategy was added.
- Constructor injection and `StubReadinessPolicy` evidence belong to PF-004,
  where the use case has real dependencies.
- Manual evidence: not applicable to this framework-independent refactor.
- Quality gate: `npm run check` passed formatting, lint, type checking, all 12
  repository tests, and the Next.js production build.
- Independent review: no Critical, Important, or Minor findings. PF-004
  constructor wiring, reservation-aware behavior, and external delivery remain
  explicitly outside this task.
