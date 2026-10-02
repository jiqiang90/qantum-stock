# ADR-005: Persisted Scenario Solution Selection

- Status: Accepted for implementation
- Date: 2026-10-02

## Context

The brief says a shortage may lead to choosing a different Solution, while the
current model fixes one nominated Solution on each Work Package. The supplied
catalogue can provide source-backed Solution records but provides neither proof
of Scenario suitability nor Product quantities.

## Decision

- Continue treating one Work Package as one planned Scenario.
- Associate each Work Package with explicit Solution Options selected from the
  source-backed catalogue subset.
- Treat option eligibility as an independently authored demonstration
  assumption, never as a conclusion from catalogue-field similarity.
- Store synthetic Product Requirements per Solution Option.
- Assume the public demonstration visitor is the authorized Team Leader.
- Persist the selected option through one constrained, conflict-aware command.
- Allow selection to persist when its recalculated result is `SHORTAGE` or
  `UNKNOWN`; selection records the plan, while status reports material evidence.
- Recalculate the existing `READY`, `SHORTAGE`, and `UNKNOWN` statuses after a
  selection.
- Do not reserve, allocate, or lock stock. Reservation remains a future slice.

## Why

This demonstrates the brief's “choosing a different solution” path without
adding a compliance workflow or an inventory-allocation subsystem. Option-owned
requirements let the status change truthfully when the selected plan changes.
The constrained command proves a bounded write path while keeping direct table
mutation unavailable to the public browser.

## Consequences

- The public demo has shared mutable state and a deliberately weak identity
  assumption. This is not a production authorization design.
- Work Package, Product usage, Aggregate Readiness, and Shortage Summary queries
  must all resolve requirements through the selected Solution Option.
- Existing readiness status semantics remain unchanged. Two Work Packages may
  still each be `READY` while competing for the same inventory; Aggregate
  Readiness exposes this risk but does not resolve it.
- A future reservation slice may introduce on-hand and allocated quantities,
  stronger statuses, atomic stock locking, and a real authorization model.

## Rejected alternatives

- **Let the Team Leader choose any catalogue Solution:** rejected because field
  similarity is not compliance evidence.
- **Rewrite Product Requirements when selecting:** rejected because option-owned
  requirements preserve each candidate plan and make preview deterministic.
- **Add reservation now:** rejected to keep this scope focused on alternative
  selection and persistence.
