# Documentation Guide

This directory separates stable product intent and specifications from technical
design, quality strategy, engineering process, and changing execution records.

## Recommended reading order

1. [`product/overview.md`](product/overview.md) — problem context, evidence gaps,
   wider workflow, roadmap, and capability status.
2. [`specs/material-readiness.md`](specs/material-readiness.md) — the accepted
   First Slice contract, requirements, acceptance criteria, and exclusions.
3. [`architecture/overview.md`](architecture/overview.md) — First Slice module
   boundaries, read and copy flows, data model, and security invariants.
4. [`quality/test-strategy.md`](quality/test-strategy.md) — risk-based test
   coverage and verification expectations.
5. [`engineering/agent-approach.md`](engineering/agent-approach.md) — how agents
   are directed, challenged, reviewed, and verified.

Canonical terminology is defined in [`glossary.md`](glossary.md). Accepted
architecture decisions are recorded under [`architecture/decisions/`](architecture/decisions/).
Designed-only future capabilities live under [`specs/future/`](specs/future/)
and must state their assumptions, validation gaps, and implementation trigger.

## Authority boundaries

| Concern                         | Authoritative location                                       |
| ------------------------------- | ------------------------------------------------------------ |
| Business context and roadmap    | `product/overview.md`                                        |
| First Slice behaviour           | `specs/material-readiness.md`                                |
| Canonical terminology           | `glossary.md`                                                |
| Architecture and data flow      | `architecture/overview.md` and its ADRs                      |
| Test coverage and quality gates | `quality/test-strategy.md`                                   |
| Agent-development account       | `engineering/agent-approach.md`                              |
| Execution status and evidence   | [`../tasks/BOARD.md`](../tasks/BOARD.md) and one active task |

Stable requirements belong in a specification. Task files link to those
requirements and record implementation evidence; they do not redefine product
behaviour.
