# PF-004B: Scenario Solution Selection

- Timebox: 90 minutes
- Depends on: PF-003A and PF-004
- Specification: `docs/specs/solution-selection.md`
- Decision: `docs/architecture/decisions/ADR-005-solution-selection.md`

## Outcome

A Team Leader can compare eligible Solution Options for one Work Package,
preview the resulting Product Requirements and Material Readiness, then persist
one selected Solution without implying stock reservation.

## Files and interfaces

- Migrate from one fixed Work Package Solution and one requirement set to
  Work-Package-owned Solution Options with option-owned Product Requirements.
- Preserve the existing source-backed Solution rows and synthetic Product,
  mapping, quantity, and inventory boundaries.
- Implement one conflict-aware selection command exposed through a validated
  route/controller adapter; keep direct public table writes denied.
- Extend `ReadinessService` with focused option preview and selection operations;
  keep readiness calculation pure and database translation in the adapter.
- Update Work Package detail with reusable option comparison and selection UI.
- Make list/detail status, Product usage, Aggregate Readiness, and Shortage
  Summary resolve the currently selected option.

## Acceptance criteria

- [ ] SS-1 through SS-12 in the specification pass at their cheapest meaningful
      boundary.
- [ ] The seed contains at least two eligible source-backed Solution Options per
      Work Package and deterministic option quantities.
- [ ] Direct anonymous table writes remain denied; only the constrained
      selection command is executable.
- [ ] Stale, unrelated, malformed, and repeated selections have the specified
      conflict, validation, and idempotency behaviour.
- [ ] Eligible options can be persisted when their recalculated result is
      `SHORTAGE` or `UNKNOWN`; status does not gate the planning choice.
- [ ] Existing readiness, Product Explorer, aggregate, and source-row guarantees
      remain intact after the model migration.
- [ ] The UI states clearly that selection does not reserve inventory.
- [ ] Option comparison and selection pass keyboard and narrow/mobile review.

## Execution checklist

- [ ] Add failing pgTAP tests for option ownership, selected-option integrity,
      option requirements, command permissions, idempotency, and stale-write
      conflict.
- [ ] Migrate and seed Solution Options and option-owned Product Requirements.
- [ ] Regenerate database types and update adapter tests for selected and
      unselected option evidence.
- [ ] Add failing service tests for option preview, selection success, unrelated
      option rejection, `SHORTAGE`/`UNKNOWN` persistence, and conflict
      translation.
- [ ] Implement the constrained selection command without exposing a service-role
      credential.
- [ ] Add failing presentation tests for comparison, preview, confirmation,
      success, failure, and conflict recovery.
- [ ] Implement the Work Package detail interaction with reusable controls and
      explicit pending/success/error states.
- [ ] Update search, Product usage, Aggregate Readiness, Shortage Summary, database
      scenario, and browser expectations to use the selected option.
- [ ] Run focused tests, database reset/tests, `npm run check`, and the selected
      browser journey.
- [ ] Complete keyboard-only and narrow/mobile review.

## Verification and evidence

Not started. Record RED/GREEN evidence, commands, database permission proof,
rendered review, and any deviation here.
