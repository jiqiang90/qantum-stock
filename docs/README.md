# Documentation Guide

The documentation is split by responsibility so product intent, technical
decisions, and execution evidence do not compete as different sources of truth.

## Main review path

1. [`product/overview.md`](product/overview.md) — business problem, evidence
   gaps, chosen slice, and roadmap.
2. [`specs/material-readiness.md`](specs/material-readiness.md) — First Slice
   requirements, acceptance criteria, assumptions, and exclusions.
3. [`specs/solution-selection.md`](specs/solution-selection.md) — eligible
   Solution preview and authenticated selection boundary.
4. [`architecture/overview.md`](architecture/overview.md) — module boundaries,
   data flow, data model, security, and trade-offs.
5. [`quality/test-strategy.md`](quality/test-strategy.md) — risk-based coverage
   and delivery gates.
6. [`engineering/agent-approach.md`](engineering/agent-approach.md) — how agents
   were guided, challenged, reviewed, and verified.

## Supporting references

- [`glossary.md`](glossary.md) defines canonical domain language.
- [`specs/product-explorer.md`](specs/product-explorer.md) and
  [`specs/source-backed-solutions.md`](specs/source-backed-solutions.md) define
  supporting delivered boundaries.
- [`architecture/decisions/`](architecture/decisions/) records accepted
  technical decisions without expanding the main architecture document.
- [`specs/future/`](specs/future/) contains designed-only capabilities; these
  are not delivered behaviour.
- [`../tasks/`](../tasks/) owns work status, implementation checklists, and
  verification evidence.

Stable behaviour belongs in specifications. Implementation plans and changing
evidence belong in the corresponding task, not in a parallel planning tree.
