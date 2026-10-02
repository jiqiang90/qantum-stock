# Delivery Board

This board is the single source of truth for execution status. Product and
architecture decisions live under `docs/`; each work item owns its checklist,
verification, and evidence.

## Status definitions

| Status        | Meaning                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| `Backlog`     | Valuable work, but a dependency or review gate is still open                                                  |
| `Ready`       | Outcome, boundary, dependencies, and acceptance criteria are clear; material assumptions have been challenged |
| `In Progress` | This is the active implementation item                                                                        |
| `Verify`      | Implementation is complete and required evidence is being gathered                                            |
| `Done`        | Acceptance criteria and recorded verification have passed                                                     |

Only one implementation item should normally be `In Progress`.

## Work items

| ID                                            | Independently verifiable outcome                         | Timebox   | Status  | Depends on              |
| --------------------------------------------- | -------------------------------------------------------- | --------- | ------- | ----------------------- |
| [PF-001](PF-001-project-foundation.md)        | Reproducible application and quality-tooling foundation  | Completed | Done    | None                    |
| [PF-001A](PF-001A-repository-baseline.md)     | Reviewed local, remote, and first-CI baseline            | 15 min    | Done    | PF-001, approval        |
| [PF-002](PF-002-readiness-domain.md)          | Framework-independent readiness decisions                | 35 min    | Done    | PF-001A                 |
| [PF-002B](PF-002B-readiness-policy.md)        | Replaceable readiness policy with unchanged behaviour    | 20 min    | Done    | PF-002                  |
| [PF-003](PF-003-local-supabase.md)            | Reproducible read-only local database and synthetic data | 60 min    | Done    | PF-002, Docker          |
| [PF-003A](PF-003A-source-backed-solutions.md) | Source-backed Solution subset with bounded demo mappings | 75 min    | Verify  | PF-003, PF-004, PF-004A |
| [PF-004](PF-004-readiness-experience.md)      | List/detail readiness experience backed by Supabase      | 75 min    | Verify  | PF-002B, PF-003         |
| [PF-004A](PF-004A-product-explorer.md)        | Read-only Product discovery and Work Package usage       | 90 min    | Verify  | PF-003, PF-004          |
| [PF-004B](PF-004B-solution-selection.md)      | Persisted eligible Solution selection and recalculation  | 90 min    | Ready   | PF-003A, PF-004         |
| [PF-005](PF-005-shortage-summary.md)          | Validated, previewable, copyable Shortage Summary        | 45 min    | Backlog | PF-002, PF-004B         |
| [PF-006](PF-006-verification-pipeline.md)     | First Slice E2E journey and local/CI verification        | 60 min    | Backlog | PF-003, PF-005          |
| [PF-007](PF-007-public-delivery.md)           | Public deployment and independently checked evidence     | 60 min    | Backlog | PF-006, approval        |

## Working rule

The human selects or assigns each task. Within an explicitly active task, AI may
edit, run commands and automated tests, review results, and update evidence. The
human completes subjective/manual checks and interactive account approvals. A
task is not `Done` until both kinds of required evidence are present.

Update the active work item during execution. Move its status here only when the
definition above is satisfied. Do not copy stable requirements, architecture,
or large command logs into this board. Proposed abstraction must solve a current
acceptance criterion or recorded risk.

PF-004A and the accepted PF-004B scope expansion both push the plan beyond the
original 4-6 hour target. This tradeoff must remain explicit; do not recover
time by diluting readiness rules, selection integrity, permission checks, the
selected journey, or delivery evidence.

## Delivery checkpoints

- **PF-004 scope review:** confirm the evidence view and remaining budget still
  support A2. Any scope change must update the spec, architecture, tests, README,
  and capability statuses together.
- **PF-004B selection boundary:** persist only an eligible Solution choice and
  recalculate readiness. Do not add reservation, allocation, stock locking, or
  new availability statuses.
- **PF-005 First Slice:** eligible Solution selection, recalculated Material
  Readiness, and a validated copyable Shortage Summary form the accepted
  functional boundary.
- **PF-007 submission gate:** CI, deployment, and public-runtime verification are
  recorded as separate evidence; none is inferred from configuration alone.
