# PF-004: Readiness Query and Experience

- Timebox: 75 minutes
- Depends on: PF-002 and PF-003

## Outcome

A Team Leader can open the Sample Work Package list, select one package, and
understand its Material Readiness from visible evidence.

## Files and interfaces

- Create a small `server-only` Supabase read client or factory using
  `@supabase/supabase-js`. No cookie or request-scoped Auth behavior is needed.
- Create a narrow readiness repository with `list()` and `findById(id)`.
- Create list/detail query use cases and focused tests.
- Implement the Supabase adapter and targeted row-mapping tests.
- Add small readiness presentation components plus list/detail pages and useful
  loading, empty, not-found, and dependency-error states.

Use cases call the domain `assessReadiness` function and do not import React,
Next.js, or Supabase.

## Acceptance criteria

- [ ] AC-1 through AC-5 in `docs/specs/material-readiness.md` are observable
      through the list/detail experience without duplicating domain logic.
- [ ] The list shows all three seeded Work Packages under one visible Sample
      Data notice.
- [ ] The nominated synthetic Solution is presented as context, not compliance
      approval or a supplied catalogue record.
- [ ] Known Product evidence shows a specific Product name and Product Code;
      generic material descriptions and units are not presented as identities.
- [ ] Loading, no-data, not-found, and dependency-failure states never imply
      readiness.
- [ ] The readiness portion of AC-9 passes keyboard and narrow/mobile review.

## Execution checklist

- [ ] Write failing use-case tests with a controlled repository.
- [ ] Implement the repository port and two small query use cases.
- [ ] Implement Supabase row translation and targeted mapping tests.
- [ ] Implement list/detail UI with the minimum reusable components.
- [ ] Add only presentation tests for risks not covered below the UI.
- [ ] Run focused tests, `npm run check`, and keyboard/mobile review.

## Verification and evidence

Not started. Record date, commands, results, and visual review details here.
