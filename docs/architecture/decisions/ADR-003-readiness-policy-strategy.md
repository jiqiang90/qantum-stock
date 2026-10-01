# ADR-003: Replaceable Material Readiness Policy

- Status: Accepted
- Date: 2026-10-02

## Context

The First Slice has one verified readiness algorithm, but credible future
customers may operate multiple concurrent Projects against shared inventory. In
that scenario, total on-hand stock is not necessarily usable stock for one Work
Package because material may be reserved for other planned work.

This variation changes the calculation rather than only presentation or stored
data. The architecture should demonstrate a replaceable policy without claiming
that reservation data, tenant selection, or a second production algorithm
already exists.

## Decision

- Define a `ReadinessPolicy` Strategy contract in the domain.
- Implement `StandardReadinessPolicy` as the only First Slice runtime Strategy;
  it preserves the accepted `READY`, `SHORTAGE`, and `UNKNOWN` rules.
- Treat `ProjectAllocatedReadinessPolicy` as a future design example only. Its
  conceptual calculation may use on-hand stock minus reservations for other
  Work Packages, but it cannot be implemented until reservation evidence and
  ownership semantics are defined.
- In PF-004, inject `ReadinessPolicy` and `ReadinessRepository` through the
  list/detail use-case constructors.
- Use `StubReadinessPolicy` only in application tests to prove that use cases do
  not hard-code the standard algorithm.
- Do not add a runtime Strategy factory, customer/project resolver, tenant
  configuration, reservation field, or unused production Strategy.

## Why

The Strategy boundary protects a credible algorithmic variation and makes the
application dependency explicit. Constructor injection keeps the choice visible
and makes use-case tests deterministic. Keeping the second Strategy test-only
avoids presenting hypothetical customer behavior as delivered functionality.

## Alternatives considered

- **Keep only a pure function:** smallest current implementation, but it does
  not demonstrate the accepted replaceable policy boundary.
- **Implement multiple production Strategies now:** rejected because no trusted
  reservation data or policy-selection contract exists.
- **Use configuration alone:** appropriate for thresholds such as snapshot age
  or safety buffer, but insufficient when the definition of usable inventory
  changes.
- **Add a dependency-injection framework:** rejected; explicit construction is
  sufficient for two narrow dependencies.

## Consequences

- Existing domain behavior must remain unchanged when moved behind
  `StandardReadinessPolicy`.
- PF-004 use cases depend on the policy contract, not the concrete Strategy.
- A test stub proves replaceability but is not capability evidence for a second
  customer policy.
- Adding a production Strategy later requires its own evidence model, selection
  rule, tests, and capability-status update.
