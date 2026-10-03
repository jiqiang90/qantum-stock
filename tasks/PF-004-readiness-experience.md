# PF-004: Readiness Query and Experience

- Timebox: 75 minutes
- Depends on: PF-002B and PF-003

## Outcome

A Team Leader can open the Work Package list, understand one package's Material
Readiness, or select multiple packages to check combined demand against shared
Inventory evidence.

## Files and interfaces

- Create a small `server-only` Supabase read client or factory using
  `@supabase/supabase-js`. No cookie or request-scoped Auth behavior is needed.
- Organize the slice under a flat `src/modules/readiness` capability module;
  keep Next.js pages as its route/controller adapters.
- Create a narrow readiness repository with `list()` and `findById(id)`, and
  inject it into one `ReadinessService` that owns list/detail orchestration.
- Keep `assessReadiness` as a framework-independent pure function. Do not add a
  runtime Strategy until a second production algorithm and selection rule exist.
- Keep selected-Work-Package aggregation as a pure readiness rule. Group demand
  by Product, count shared Inventory once, and do not persist reservations or
  allocations.
- Implement the Supabase adapter and targeted row-mapping tests.
- Split list and detail presentation components rather than concentrating them
  in one large view file. Add useful loading, empty, not-found, and
  dependency-error states.

The service and readiness calculation do not import React, Next.js, or Supabase.
The repository port remains replaceable because it protects a real external
integration boundary; customer-specific runtime plugins are outside this slice.

## Acceptance criteria

- [x] AC-1 through AC-7 in `docs/specs/material-readiness.md` are observable
      through the list/detail experience without duplicating domain logic.
- [x] The list shows all six seeded Work Packages without repeated `DEMO`
      identity prefixes; README and reviewer documentation carry the read-only
      demo context.
- [x] The nominated source-backed Solution is presented as catalogue context,
      not compliance or Product-mapping approval.
- [x] Known Product evidence shows a specific Product name and Product Code;
      generic material descriptions and units are not presented as identities.
- [x] Loading, no-data, not-found, and dependency-failure states never imply
      readiness.
- [x] Service tests prove repository substitution through constructor injection
      without a dependency-injection framework.
- [ ] The readiness portion of AC-11 passes keyboard and narrow/mobile review.

## Execution checklist

- [x] Add shareable Work Package search and readiness filtering without hidden
      selections affecting Aggregate Readiness.
- [x] Redesign Work Package detail around separate nominated-Solution and
      Product-Requirements sections with explicit mapping relationships.
- [x] Lock the delivered behavior with domain, service, adapter, and rendered UI
      tests before structural changes.
- [x] Move the capability from `src/features/readiness` to the flat
      `src/modules/readiness` structure.
- [x] Replace the two query classes and runtime Strategy wrapper with one
      repository-injected `ReadinessService` plus pure `assessReadiness`.
- [x] Split the list and detail presentation components and update page imports.
- [x] Remove the old layered directories and stale Strategy guidance.
- [x] Implement Supabase row translation and targeted mapping tests.
- [x] Implement list/detail UI with the minimum reusable components.
- [x] Add only presentation tests for risks not covered below the UI.
- [x] Run focused tests and `npm run check` after the structural refactor.
- [ ] Complete the keyboard-only review and subjective mobile/UX sign-off.

## Verification and evidence

### Automated and rendered evidence — 2026-10-02

- Test-first development began with missing-module failures for the application
  queries, Supabase row mapper, and boundary validation. The focused tests then
  passed, and the complete suite contains 5 test files and 23 tests.
- Before the simplification, application tests injected both a controlled
  `ReadinessRepository` and a test-only `StubReadinessPolicy`. This formed part
  of the behavior lock; the final service tests replace the hypothetical policy
  substitution check with the real pure readiness calculation. Adapter tests
  prove requirement ordering, deterministic latest-snapshot selection, missing
  evidence, and numeric zero.
- `npm run format:check`, `npm run lint`, `npm run typecheck`, and the full test
  suite passed. `npm run build` compiled `/` and `/work-packages/[id]` as dynamic
  server-rendered routes.
- The production build ran against the reset local Supabase instance. `/`
  returned the Work Packages; the shortage detail showed Product
  `PW-050`, required `4 roll`, available `0 roll`, missing `4 roll`, and
  reason `Insufficient quantity`. An invalid ID showed the explicit Work Package
  not-found state.
- The loading state was observed during navigation. A second production runtime
  with an unreachable data URL rendered `Data unavailable`, did not imply
  readiness, exposed no database details, and offered `Try again`.
- The actual list and shortage-detail pages were inspected at the normal panel
  width and a 390-pixel viewport. Content reflowed without hiding status,
  evidence, or navigation.
- App Router convention files were verified through production runtime rather
  than test-first isolation; business behavior, mapping, and input boundaries
  were developed test-first.

### Architecture simplification in progress — 2026-10-02

- The delivered behavior above is the regression baseline for a user-approved,
  behavior-preserving refactor.
- The cleanup targets needless layer nesting, two single-purpose query classes,
  a hypothetical runtime Strategy, and a 305-line combined view file.
- The Supabase repository port, pure readiness rules, public read-only boundary,
  route behavior, copy, and evidence semantics must remain unchanged.
- Focused refactor verification passed all 5 module test files and 23 tests;
  TypeScript validation also passed after the old directories were removed.
- The final `npm run check` passed formatting, lint, type checking, all 23 tests,
  and the production build. `npm audit --audit-level=low` reported no known
  vulnerabilities.
- The rebuilt production runtime returned the Work Package list and the
  shortage detail with Product `PW-050`, required `4 roll`, available
  `0 roll`, missing `4 roll`, and reason `Insufficient quantity`.
- The first runtime restart intentionally had no committed `.env.local` and
  therefore rendered the dependency-error boundary. Restarting with the local
  Supabase public URL and publishable key restored data; no code change was
  required.
- A user-approved detail-page refinement replaced the `All Work Packages`
  back-link with semantic breadcrumb navigation. The nominated Solution remains
  visible as compact metadata, while the prominent context card and repeated
  compliance disclaimer were removed from the operational UI; the boundary
  remains documented in the specification.
- The breadcrumb refinement followed RED/GREEN presentation tests. The final
  `npm run check` passed formatting, lint, type checking, all 49 application
  tests, and the production build; the dependency audit found 0 vulnerabilities.
- After the multi-Product seed redesign, the rebuilt runtime rendered 6 Work
  Packages. The two service-riser packages are individually `READY`, while
  selecting both exposes an aggregate `IS-310` shortage: `10 cartridge`
  required, `8 cartridge` available, and `2 cartridge` missing. After PF-003A,
  `Level 3 ceiling conduit penetrations` retains missing-snapshot and
  missing-required-quantity evidence without the inconsistent cable-pillow
  requirement.
  Product codes no longer use a repeated `DEMO-` prefix.
- The aggregate check followed a RED/GREEN path at the domain, boundary,
  presentation, database-scenario, and browser boundaries. Final local evidence
  passed 69 application tests, 61 pgTAP assertions, 2 Playwright tests, the
  production build, database lint, and diff whitespace validation. Desktop and
  390-pixel rendered captures showed the selected-package summary and responsive
  Product totals without horizontal overflow.

### Work Package detail relationship redesign — 2026-10-02

- RED evidence: the focused presentation run failed 2 tests because the old
  page had no named nominated-Solution section or explicit
  Solution-to-Product-Requirements relationship.
- The page now separates the nominated Solution and Product Requirements into
  two primary sections. A compact readiness path reports mapped and unmapped
  requirement counts, and every requirement row states whether it is mapped
  through the nominated Solution.
- Requirements use the shared responsive table components with visible desktop
  headings and labelled stacked fields on narrow screens. Product links remain
  keyboard reachable in reading order.
- Desktop checks covered an all-mapped READY package and a mixed package with
  `2 mapped · 1 unmapped`, a confirmed shortage, and one UNKNOWN requirement.
  A 390-pixel Chromium check reported equal client and scroll widths (`390`),
  so the redesigned page introduced no horizontal document overflow.
- Keyboard traversal followed skip link, primary navigation, breadcrumb, then
  Product links. Heading order was Work Package, Nominated Solution, Product
  Requirements.
- `npm run check` passed formatting, lint, type checking, 71 application tests,
  and the production build. `git diff --check` passed, and all changed source
  and test files remain below the 500-line ceiling.

### Work Package search and filtering — 2026-10-02

- Three RED/GREEN cycles covered URL-boundary normalization, case-insensitive
  Work Package and visible Solution-evidence matching, combined readiness
  filtering, result counts, filtered-empty recovery, and selection-preserving
  comparison submission.
- Work Packages and Products now reuse shared search, select, chevron, and form
  action components rather than maintaining parallel control implementations.
- Runtime checks confirmed `riser + READY` returns `2 of 6 Work Packages` at
  `/?q=riser&status=READY`. Selecting both results preserves those filters and
  produces the expected aggregate shortage; applying filters again removes the
  selection and aggregate result so hidden packages cannot contribute.
- The no-result state preserves the active URL filters and exposes a direct
  reset to `/`. A 390-pixel Chromium render had no document overflow and kept
  search, filter, rows, and comparison controls in reading order.
- `npm run check` passed formatting, lint, type checking, 80 application tests,
  and the production build. `git diff --check` passed; all changed source and
  test files remain below the 500-line ceiling.

### Work Package detail information-density refinement — 2026-10-02

- Removed the repeated Readiness path card and the Material evidence/Product
  Requirements summary block; the nominated Solution now flows directly into
  the labelled Product Requirements table.
- Removed the repeated `Mapped via <Supplier> <Internal Code>` copy from known
  Product rows. The selected Solution is already visible above the table; only
  the exceptional unmapped state retains an explicit warning.
- The overall and row-level status evidence remains available, and the empty-
  requirements state is unchanged.
- Test-first evidence failed on the still-visible relationship card and count,
  then passed after the component simplification. Formatting, lint, typecheck,
  all 80 application tests, and the production build passed.
- Desktop and 390-pixel rendered checks showed the table directly after the
  Solution section with no redundant summary copy or horizontal overflow.

### Human verification remaining

- [ ] Review `/` and the shortage detail with keyboard-only navigation, confirm
      focus visibility and reading order, and provide the subjective UX sign-off.
