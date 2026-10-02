# ADR-006: Public Read and Authenticated Write

- Status: Accepted for implementation
- Date: 2026-10-03

## Context

The public take-home demonstration should remain easy to review, but PF-004B
introduces the application's first persistent mutation: changing a Work
Package's Selected Solution. Treating every anonymous visitor as an authorized
Team Leader would let any person with the public URL change shared demo state.

A production passive-fire operations system would normally protect its planning,
inventory, and project data behind authentication and project-scoped
authorization. The brief does not provide the identity, Organisation, Project,
work-ownership, or role model needed to implement that production boundary.

## Decision

- Keep Work Package, Product, Solution, inventory, and readiness views publicly
  readable in the demonstration.
- Give authenticated visitors the same read access so signing in never removes
  access to the public evidence.
- Require a Supabase Auth session before persisting a Selected Solution.
- Provide sign-in and sign-out for one pre-provisioned Demo Team Leader account.
- Disable self-service sign-up, password recovery, profile management, and user
  administration for this slice.
- Treat the only provisioned authenticated account as authorized to select an
  eligible Solution Option for every demonstration Work Package.
- Deny the anonymous role execute permission on the selection command. Grant the
  authenticated role only that constrained command; keep direct table insert,
  update, and delete denied.
- Keep authentication session handling request-scoped and server-side. Do not
  expose a service-role credential to the browser or application runtime.
- Record full-site authentication plus Organisation-, Project-, and role-scoped
  authorization as the production target, not as delivered capability.

## Why

Anonymous read access keeps the public assessment frictionless. Authentication
at the first mutation creates a defensible write boundary without inventing a
tenant or RBAC model unsupported by the brief. A pre-provisioned account avoids
turning the take-home into account registration and recovery work.

## Consequences

- Anonymous reviewers can inspect and preview the complete demonstration but are
  prompted to sign in before `Use this Solution` can persist a change.
- PF-004B must include login, logout, session-expiry handling, authenticated
  command execution, and permission tests.
- Demo credentials are provisioned outside Git and shared privately; no password
  appears in source, seed data, logs, screenshots, or public documentation.
- An authenticated session proves only access to the bounded demo write. It does
  not prove a real Team Leader role, Project membership, or work ownership.
- The additional Auth work increases the PF-004B estimate and must not displace
  conflict, eligibility, readiness, accessibility, or security verification.
- The selected Solution remains shared demo state. The command is reversible and
  limited to eligible options, while deterministic reset data remains the
  baseline for automated verification.

## Rejected alternatives

- **Anonymous constrained write:** smaller, but anyone with the public URL could
  alter shared state and interfere with another review session.
- **Require login for the whole demo:** closer to a production system, but adds
  review friction without solving the missing tenancy and authorization model.
- **Build production RBAC now:** rejected because role assignment, Organisation,
  Project access, and work ownership are not established by the brief.
