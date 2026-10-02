# PF-005: Combined Availability and Copyable Shortage Summaries

- Timebox: 90 minutes
- Depends on: PF-002 and PF-004B

## Outcome

A Team Leader can enable Combined Availability mode on the Work Packages page,
select two or more packages, review their Combined Availability Report, and
copy its blocking evidence. They can also select Blocking Requirements on one Work
Package, add an optional note, preview a deterministic Shortage Summary, and
copy it without the product claiming either summary was sent.

## Files and interfaces

- Hide multi-select controls in the default Work Package list and reveal them
  only after `Check combined availability` enables a validated, shareable mode
  on the same route.
- Create pure single-package and combined-summary builders with co-located unit
  tests. Share formatting helpers only where both concrete formats need them.
- Create Zod boundary schemas for the two input shapes: selected requirement
  IDs plus optional note, and selected Work Package IDs.
- Add focused presentation components for report summary preview, copy state,
  and manual-copy fallback.

The builders consume already calculated single or Aggregate Readiness evidence;
they have no repository, network, database, or clipboard dependency. The
single-package note is trimmed, blank becomes absent, and the maximum length is
500 characters. The combined summary copies the visible report evidence and
does not add a second note form.

## Acceptance criteria

- [x] AC-6 through AC-8 in `docs/specs/material-readiness.md` pass at their
      focused unit or presentation boundary.
- [x] Duplicate blocker selections are rejected with useful validation;
      duplicate or malformed Work Package query IDs are normalized before the
      aggregate calculation.
- [x] Exact output matches the template and unknown/time formatting in the First
      Slice specification.
- [x] The default Work Package list has no checkboxes and exposes one
      `Check combined availability` mode action.
- [x] Combined Availability mode on the same route requires at least two valid
      visible Work Packages and presents a shareable report in a modal dialog.
- [x] Closing the Combined Availability Report preserves the selected Work
      Packages for adjustment, removes the completed check attempt from the URL,
      and restores focus to `Check availability`.
- [x] Leaving Combined Availability mode clears selection and restores the
      browse-only list without discarding applicable filters.
- [x] A combined `SHORTAGE` or `UNKNOWN` result produces the deterministic
      combined Shortage Summary without claiming inventory was reserved.
- [ ] The summary portion of AC-11 passes keyboard and narrow/mobile review.
- [x] No summary, report, user, recipient, or delivery state is persisted.

## Execution checklist

- [x] Write failing builder tests for exact content, ordering, unknown evidence,
      zero, note normalization, and invalid selections.
- [x] Write failing boundary and component tests for entering and leaving the
      mode, selection, report, and combined summary.
- [x] Move the existing aggregate interaction without changing its domain
      calculation or source-backed regression evidence.
- [x] Implement the smallest pure builder that passes them.
- [x] Write focused interaction tests for both copy contexts, copy success, and
      clipboard rejection.
- [x] Implement preview and copy feedback in the detail and combined pages.
- [x] Present the combined report as an accessible, responsive modal dialog.
- [ ] Run focused tests, `npm run check`, and a keyboard review. Automated
      checks are complete; the human interaction review remains.

## Verification and evidence

Automated verification on 3 October 2026:

- `npm test -- src/modules/readiness`: 9 files, 71 tests passed before the
  component-test split; the complete gate below reruns the resulting suite.
- targeted Playwright for aggregate readiness and shortage summary: 2 tests
  passed against local Supabase.
- `npm run check`: formatting, lint, typecheck, 18 files / 126 tests, and the
  production build passed with no lint warnings.
- `npm run db:test`: 4 files / 107 pgTAP tests passed.
- modal follow-up: the focused component file passed 7 tests; the aggregate
  Playwright journey passed with dialog semantics, Escape and explicit close,
  preserved selection, repeat checking, and focus recovery; `npm run check`
  passed with 18 files / 127 tests and a production build.

Outstanding manual evidence: keyboard and narrow/mobile review of the two
summary flows.
