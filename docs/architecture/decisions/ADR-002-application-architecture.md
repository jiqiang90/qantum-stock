# ADR-002: Capability Modules in a Modular Monolith

- Status: Accepted
- Date: 2026-10-02

## Context

The First Slice needs clear business rules and replaceable external integration,
but its 4-6 hour target does not justify distributed services or a framework of
unused abstractions.

## Decision

- Use one Next.js application organized by business capability.
- Keep Material Readiness policy framework-independent.
- Put list/detail orchestration in small application use cases.
- Define one narrow readiness repository port and implement it with Supabase.
- Build Shortage Summary text with a pure function from an already calculated
  readiness assessment; do not add a persistence port.
- Keep presentation responsible for interaction state and clipboard feedback,
  not readiness policy.
- Use explicit constructor injection where a use case depends on the readiness
  repository and policy Strategy.
- Prefer a class only when it encapsulates state, invariants, lifecycle, or
  polymorphism; use pure functions for stateless calculations.

## Why

This structure makes the domain rules directly testable, isolates Supabase row
translation, and keeps the two I/O edges visible without introducing a separate
server or class-per-table design.

## Consequences

- Route/pages cannot query Supabase directly when the query belongs to the
  readiness capability.
- Domain and summary tests run without Next.js or Supabase.
- Clipboard behavior needs a small browser boundary test, while summary content
  is covered by unit tests.
- If persistent handoff is later approved, it becomes a new capability with its
  own command boundary rather than being hidden in the readiness query module.
- The readiness Strategy boundary and its future reservation-aware variation are
  defined in
  [`ADR-003`](ADR-003-readiness-policy-strategy.md).
