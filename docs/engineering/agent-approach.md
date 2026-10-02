# Agent-assisted Engineering Approach

## Purpose

This is a collaborative 4-6 hour exercise. AI can guide, challenge, edit, run
commands and automated checks, and review evidence within an explicitly active
task. The human retains product judgment, delivery ownership, account approval,
and manual UX, accessibility, and device testing. The repository makes that
division reviewable through authoritative documents, small work items, explicit
acceptance criteria, and recorded evidence.

## Control loop

1. The human selects one work item from `tasks/BOARD.md`.
2. AI explains the linked constraints and challenges unclear value, assumptions,
   security, or scope.
3. AI proposes and, when asked, executes a focused red/green implementation path.
4. AI runs automatable checks and records their actual output.
5. The human performs identified manual or account-interactive checks and reports
   the result.
6. AI reviews the combined evidence and identifies concrete remaining risks.
7. Task status changes only when its automated and required human evidence are
   both present.

Authorization for one task does not authorize later tasks, destructive Git
operations, deployment, or unrelated provider changes.

`AGENTS.md` contains the enforceable repository-wide rules. The task files hold
execution state; stable requirements stay in the spec rather than being copied
into each task.

## How agents are constrained

- A 500-line ceiling forces responsibility-based splitting before files become
  context dumps.
- The glossary prevents later context windows from inventing synonyms or
  changing quantity semantics.
- Domain logic cannot depend on React, Next.js, or Supabase.
- Every layer must own policy, orchestration, translation, or external I/O.
- Designed-only future seams are documented, not scaffolded as unused code.
- No Git, provider, or deployment mutation occurs without explicit user
  authorization.
- AI may update task status from verified evidence when executing an explicitly
  assigned task, but must leave human-only checks open until the human reports
  their result.
- Completion claims require current command output and are kept separate from
  CI, deployment, and public-runtime proof.

## Recorded challenge and correction

The initial design treated shortage reporting as a persisted record protected by
anonymous Auth and creator-only RLS. Architecture review found a product
contradiction: the record had no defined recipient, owner, acknowledgement, or
resolution path, so it was durable without actually escalating anything. It
also consumed a large portion of the timebox in Auth, SQL RPC, RLS, and
two-session testing.

The design was corrected to **A2: Readiness + Copy Shortage Summary**:

- retain Supabase as the read-only local/hosted source of truth;
- calculate and explain readiness;
- validate selected Blocking Requirements;
- generate deterministic, user-visible text;
- copy with an accessible manual fallback;
- state `Copied`, never `Sent`;
- defer persistence, identity, recipients, assignment, notification, and audit
  until those operational contracts are known.

This is not a hidden downgrade. It is an explicit scope decision that preserves
the strongest evaluable technical concerns while removing unsupported workflow.

## Proportionate design examples

- The Supabase query has a repository port because it is an external dependency
  and row translation boundary.
- The summary builder is a pure function because a class or port would add no
  invariant, lifecycle, or replaceable I/O.
- One nominated Solution per Work Package is documented as an assumption
  rather than introducing a speculative Scenario entity.
- Row-level synthetic-data flags are omitted because provenance is clear at the
  table boundary: selected Solution fields are source-backed; Work Packages,
  Products, mappings, quantities, and inventory are synthetic. The persistent
  read-only-demo header communicates the overall environment without repeated
  warning text or identity prefixes.
- A generic `source_reference` is omitted because Solution already preserves its
  Supplier, Internal Code, and Supplier Ref. Code explicitly.

## Review focus

A reviewer should be able to trace:

- brief fact or explicit assumption -> First Slice requirement;
- requirement -> domain/application boundary;
- risk -> focused test;
- work item -> current evidence;
- future concern -> Designed-only capability or Production Gap.

If those links cannot be shown, the design is either under-specified or
over-designed and should be corrected before more code is added.
