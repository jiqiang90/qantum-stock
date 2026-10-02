# ADR-004: Simplify the Readiness Capability Module

- Status: Accepted
- Date: 2026-10-02
- Supersedes: the runtime Strategy decision in
  [ADR-003](ADR-003-readiness-policy-strategy.md)
- Amends: the internal module shape in
  [ADR-002](ADR-002-application-architecture.md)

## Context

The first Readiness implementation proved its domain rules, Supabase mapping,
list/detail flow, and failure states. It also showed that four nested technical
layers, two one-method query classes, and a runtime Strategy contract add more
navigation and terminology than this single delivered algorithm requires. The
combined presentation file remained the largest hand-written implementation
file, so complexity was not distributed around the responsibilities that
actually change independently.

Different customers and Projects may eventually vary in data sources,
configuration, permissions, or allocation semantics. That possibility alone is
not evidence for a customer plugin system or a second readiness algorithm.

## Decision

- Organize business code by capability under `src/modules`, starting with a
  flat `src/modules/readiness` module.
- Keep Next.js `page.tsx` and future `route.ts` files as route/controller
  adapters; do not introduce pass-through controller classes.
- Keep the narrow `ReadinessRepository` port because Supabase is a real external
  integration and test boundary.
- Replace separate list/detail query classes with one repository-injected
  `ReadinessService` exposing `list()` and `findById(id)`.
- Expose readiness calculation as the pure `assessReadiness(requirements)`
  function. Remove the single-production-implementation `ReadinessPolicy`
  Strategy and its wrapper class.
- Split list and detail presentation into focused components with only small,
  stable display helpers shared between them.
- Extract a Strategy only after a second production algorithm, its evidence
  model, and its runtime selection rule are known.

## Why

This keeps the real boundaries—business calculation, application orchestration,
external data translation, and route/presentation—without mirroring every
boundary as a directory or class. It is easier to navigate within the take-home
timebox and remains testable without claiming an unproven plugin requirement.

## Alternatives considered

- **Keep the four nested layers:** valid for a larger module, but too much
  navigation for the current file count and responsibilities.
- **Global `models/controllers/services` directories:** familiar but scatters
  one business capability across the repository and duplicates App Router's
  controller role.
- **Customer plugin architecture:** rejected until authentication, tenancy,
  configuration ownership, a second implementation, and selection semantics
  exist.

## Consequences

- Existing imports and tests move, but user-visible behavior does not change.
- Constructor injection remains at the repository boundary.
- Readiness rules remain directly unit-testable as pure domain behavior.
- A future second algorithm may justify a Strategy ADR; it is not pre-built now.
