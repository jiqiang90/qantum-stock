# ADR-001: Runtime Data and Public Hosting

- Status: Accepted
- Date: 2026-10-02

## Context

The exercise asks for a public, testable First Slice, but the supplied catalogue
does not contain the Product mappings, demand, or inventory needed to calculate
Material Readiness. The selected A2 slice reads synthetic operational data and
copies a transient summary; it does not need durable user writes.

## Decision

- Use Supabase Postgres for local and hosted runtime data.
- Use versioned migrations and deterministic synthetic seed data.
- Give the public runtime role read-only access to the minimum demo dataset.
- Do not add Supabase Auth, write policies, RPC write functions, or persisted
  Shortage Reports to A2.
- Deploy the Next.js application to Vercel only when external setup is
  authorized.
- Keep the supplied CSV ignored and outside the runtime path.

## Why

Supabase provides one PostgreSQL model for repeatable local tests and a hosted
demo. Keeping runtime access read-only matches the actual A2 behavior and avoids
inventing identity, recipients, or tenancy merely to make a record durable.

## Alternatives considered

- **JSON fixtures:** fastest initially, but weaker evidence for data modeling and
  local/hosted parity.
- **SQLite:** useful for local persistence, but different from the chosen hosted
  runtime and adds deployment translation.
- **Persisted creator-only report with anonymous Auth:** rejected. It adds
  substantial security and testing work yet still does not deliver an issue to
  a real recipient, so it is not a credible escalation.
- **Service-role server access:** rejected. A privileged secret is unnecessary
  for public read-only Sample Data.

## Consequences

- Local development requires a Docker-compatible runtime for the Supabase stack.
- Database grants/policies and denied mutations must be tested.
- The app remains useful if the summary is copied, but it cannot recover summary
  history after navigation or prove that anyone received it.
- Authentication and persistent handoff require a later ADR once identity,
  recipient, ownership, and tenancy are known.
