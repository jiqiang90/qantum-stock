# PF-005: Copyable Shortage Summary

- Timebox: 45 minutes
- Depends on: PF-002 and PF-004

## Outcome

A Team Leader can select Blocking Requirements, add an optional note, preview a
deterministic Shortage Summary, and copy it without the product claiming it was
sent.

## Files and interfaces

- Create a pure summary builder and co-located unit tests.
- Create a Zod boundary schema for Work Package ID, selected requirement IDs,
  and the optional note.
- Add the smallest presentation component needed for selection, preview, copy
  state, and manual-copy fallback.

The builder consumes the existing `ReadinessAssessment`; it has no repository,
network, database, or clipboard dependency. The note is trimmed, blank becomes
absent, and the maximum length is 500 characters.

## Acceptance criteria

- [ ] AC-6 through AC-8 in `docs/specs/material-readiness.md` pass at their
      focused unit or presentation boundary.
- [ ] Duplicate selections are rejected with useful validation.
- [ ] Exact output matches the template and unknown/time formatting in the First
      Slice specification.
- [ ] The summary portion of AC-9 passes keyboard and narrow/mobile review.
- [ ] No summary, report, user, recipient, or delivery state is persisted.

## Execution checklist

- [ ] Write failing builder tests for exact content, ordering, unknown evidence,
      zero, note normalization, and invalid selections.
- [ ] Implement the smallest pure builder that passes them.
- [ ] Write focused interaction tests for copy success and clipboard rejection.
- [ ] Implement selection, note, preview, and copy feedback in the detail page.
- [ ] Run focused tests, `npm run check`, and a keyboard review.

## Verification and evidence

Not started. Record date, commands, results, and interaction review here.
