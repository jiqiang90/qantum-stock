# ADR-001: Runtime Data and Public Hosting

- Status: Partially superseded by
  [ADR-005](ADR-005-solution-selection.md) and
  [ADR-006](ADR-006-demo-authentication-boundary.md)
- Date: 2026-10-02

## Context

The exercise asks for a public, testable First Slice, but the supplied catalogue
does not contain the Product mappings, demand, or inventory needed to calculate
Material Readiness. The original A2 baseline reads synthetic operational data
and copies a transient summary. The accepted PF-004B extension adds one durable
selected-Solution write.

## Decision

- Use Supabase Postgres for local and hosted runtime data.
- Use versioned migrations and deterministic synthetic seed data.
- Give the anonymous and authenticated runtime roles read access to the same
  minimum demo dataset.
- Require the authenticated role for the constrained selected-Solution command;
  keep direct table writes denied to both runtime roles.
- Add only the bounded Supabase Auth behavior accepted in ADR-006. Do not add
  self-service accounts, general write policies, or persisted Shortage Reports.
- Deploy the Next.js application to Vercel only when external setup is
  authorized.
- Keep the supplied CSV ignored and outside the runtime path.

## Why

Supabase provides one PostgreSQL model for repeatable local tests and a hosted
demo. Keeping direct table access read-only and protecting one bounded command
avoids inventing a general administration surface. Authentication identifies
the pre-provisioned demo user; it is not a production role or tenancy model.

## Alternatives considered

- **JSON fixtures:** fastest initially, but weaker evidence for data modeling and
  local/hosted parity.
- **SQLite:** useful for local persistence, but different from the chosen hosted
  runtime and adds deployment translation.
- **Persisted creator-only report with anonymous Auth:** rejected. It adds
  substantial security and testing work yet still does not deliver an issue to
  a real recipient, so it is not a credible escalation.
- **Service-role server access:** rejected. The constrained command is exposed
  through the publishable role and does not require a privileged secret.

## Consequences

- Local development requires a Docker-compatible runtime for the Supabase stack.
- Database grants, denied direct mutations, and constrained command execution
  must be tested.
- The app remains useful if the summary is copied, but it cannot recover summary
  history after navigation or prove that anyone received it.
- Production-wide authentication, role authorization, ownership, tenancy, and
  persistent handoff require later decisions once their business contracts are
  known.
