<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Passivefire agent instructions

## Mission and scope

Build the first Team Leader value slice: review the Material Readiness of a
Sample Work Package before travelling to site, understand Blocking Requirements,
and prepare and copy a Shortage Summary.

The wider product context and capability roadmap live in
`docs/product/overview.md`. The accepted First Slice contract is
`docs/specs/material-readiness.md`. Technical boundaries and accepted decisions
live in `docs/architecture/overview.md` and `docs/architecture/decisions/`.
Treat each document as authoritative for its concern. Do not expand the slice
into authentication, persistent reports, recipients, assignment, notifications,
purchasing, stock management, scheduling, Alternative-Solution approval,
offline sync, or administration.

The supplied `data/solutions-excerpt.csv` is ignored local reference material
and must not enter Git history or become a runtime dependency. Each row
represents a Solution; `Internal Code` and `Supplier Ref. Code` identify that
Solution and must not be reused as Product identifiers. Although the brief says
the catalogue includes required products, the received CSV exposes no Product
fields or Solution-to-Product relationship. The committed demo dataset and its
user-facing surfaces must be clearly labelled as Sample Data. Synthetic
Solutions, Products, Work Packages, Product Requirements, quantities, mappings,
and inventory values must not copy supplied catalogue records. A Product is a
specific stock-tracked item with its own synthetic Product Code and specific
name; generic labels such as `Fire Collar` or `Fire Sealant`, and units such as
`cartridge`, are not Product identities. A matching catalogue field is never
proof that a fire-stopping solution is compliant or approved.

## Canonical language

- `docs/glossary.md` is authoritative for domain and project-boundary
  terminology.
- Reuse its canonical term across UI copy, code, tests, APIs, storage, and docs.
- Do not introduce a synonym for an existing concept. If the concept is genuinely
  new, update the glossary before using the term broadly.
- Use `Prepare shortage summary`, `Shortage Summary`, and `Copy summary` for the
  accepted A2 interaction. Do not call copying `reporting`, `sending`, or
  `escalating`.

## Architecture

- Keep a Next.js modular monolith organized by business capability.
- Presentation adapters call application use cases. Read use cases depend on
  domain policy and a small repository port; Supabase adapters implement that
  port. Pure summary construction needs no repository abstraction. Domain code
  never depends on a repository port.
- Domain and application code must not import Supabase, Next.js request/response
  types, or React.
- Route handlers translate transport concerns and call one application use case;
  they do not contain business rules or direct database queries.
- Repository ports belong beside the use case that consumes them. Keep them
  small and capability-specific.
- Use explicit constructor injection. Do not introduce a dependency-injection
  framework or a separate Node service for this slice.
- Prefer object-oriented design for domain entities, value objects, application
  use cases, ports, and adapters. Encapsulate invariants and inject dependencies
  through constructors.
- Use pure functions when a calculation is stateless and a class would add no
  encapsulation, identity, lifecycle, or polymorphism. OOP-first does not mean
  class-per-table or pass-through classes.
- A module has one reason to change. Do not create pass-through layers that add
  no boundary or policy.

## Challenge the brief

- Do not agree by default. Actively challenge assumptions that affect user value,
  data meaning, security, scope, acceptance criteria, or architecture.
- Grill the decision, not the person: state the weak assumption, concrete impact,
  available evidence, and recommended resolution.
- Ask the single highest-value question when an answer would materially change
  the result. Offer a small set of options and recommend one.
- Do not stop for every reversible implementation detail. Choose the smallest
  reasonable option, record the assumption in the active work item, and continue.
- Once a decision is accepted, do not reopen it without new evidence or a real
  contradiction.

## Keep the design proportionate

- Implement the simplest design that satisfies the active work item's acceptance
  criteria and known production risks.
- Do not add an abstraction, extension point, dependency, service, event, queue,
  cache, or configuration option for a hypothetical future requirement.
- One implementation does not justify a generic framework. Extract shared
  behaviour only when a second concrete use or protected invariant exists.
- Prefer a direct, replaceable implementation over a configurable system with no
  current consumer.
- Every new layer must own translation, orchestration, policy, or external
  integration. Delete layers that only rename or forward calls.
- If a proposed design cannot be explained through the selected user journey,
  remove it or record why the current slice genuinely requires it.

## Designed versus implemented

- Use the capability statuses defined in `docs/product/overview.md`; never
  present planned work as delivered evidence.
- Documents may describe future seams. Mark future diagram nodes with dashed
  lines and `Future`.
- Do not create unused classes, ports, routes, tables, fields, or configuration
  for designed-only capabilities.
- Do not return placeholder success from an executable path.
- A code `TODO` must state what is missing, the trigger for implementing it,
  and its current impact. Use a work item when that explanation is larger than a
  short local note.

## Data and security

- Supabase Postgres is the runtime source of truth; versioned synthetic seed
  files are ingestion inputs only. The ignored supplied CSV is local reference
  material, not a seed or runtime dependency.
- Each Product owns one canonical unit. First Slice requirement and inventory
  quantities are already expressed in that unit. Do not introduce packaging or
  unit-conversion behaviour; it is a documented Production Gap.
- Browser code may use only the public Supabase URL and publishable key.
- Never expose or commit a service-role key.
- The First Slice has no authenticated actor and performs no runtime database
  write. Do not manufacture identity merely to persist a creator-only record.
- Exposed Sample Data tables must permit the public role to read only the data
  required by the demo and must reject insert, update, and delete.
- The Shortage Summary exists only in presentation/application memory and the
  user's clipboard. It has no ID, recipient, delivery state, or audit claim.

## Code and quality

- Use strict TypeScript and validate untrusted input with Zod at the boundary.
- Prefer descriptive domain names over generic helpers or table-shaped service
  classes.
- Treat 500 physical lines as a hard ceiling, not a target. Keep every
  hand-written text source file at or below that ceiling, including tests,
  configuration, SQL, and Markdown. Split by responsibility before crossing the
  limit. Generated files, dependency locks, supplied data, and binary artifacts
  are excluded.
- ESLint enforces the limit for JavaScript and TypeScript. The delivery work
  item audits the remaining hand-written text files.
- Co-locate unit tests with source. Put browser journeys under `e2e/` and
  database policy tests under `supabase/tests/`.
- Add tests before implementation for domain rules and use cases.
- Cover happy paths, missing data, insufficient stock, invalid selection,
  read-access boundaries, and clipboard failure where relevant.
- Before claiming a task complete, run the relevant focused tests plus
  `npm run format:check`, `npm run lint`, and `npm run typecheck`. Run
  `npm run check` before delivery.
- Do not suppress lint, type, test, or security failures merely to make a check
  pass.
- Follow the risk coverage and evidence rules in
  `docs/quality/test-strategy.md`.

## Working agreement

- Delivery is collaborative. When the human starts or assigns a task, AI may
  edit files, run local commands and automated tests, and perform explicitly
  authorized Git or provider operations within that task's boundary.
- The human performs steps that require subjective or physical judgment,
  interactive account approval, secrets they choose not to share, or manual UX,
  accessibility, and device validation.
- AI must identify those manual checks clearly and combine their human-reported
  evidence with automated evidence; it must not claim to have performed them.
- Do not initialize Git, commit, push, deploy, or change an external provider
  without explicit human authorization. Authorization to start one task does not
  automatically authorize later delivery tasks.
- Read `tasks/BOARD.md`, then exactly one active work item before changing code.
- Update execution status only in `tasks/BOARD.md`. Keep the active work item's
  checklist, verification, evidence, and deviations current while executing it.
- Read the product, technical, and test documents relevant to that work item.
- Record new assumptions and architectural decisions before implementing them.
- Keep changes within the active work item and report any proposed scope change
  before acting on it.
- Do not copy stable requirements or architecture into work items; link to the
  authoritative document instead.
- Do not initialize, commit, push, or otherwise mutate Git unless the user
  explicitly asks.
