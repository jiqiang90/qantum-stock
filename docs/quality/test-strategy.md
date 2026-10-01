# Test Strategy

## Principle

Test each risk at the cheapest boundary that can prove it, then use one browser
journey to prove that the boundaries are wired together. Do not duplicate every
domain case through React, SQL, and Playwright.

## Risk coverage

| Risk                                            | Primary evidence                                   |
| ----------------------------------------------- | -------------------------------------------------- |
| Incorrect readiness precedence or quantity math | Domain unit tests                                  |
| Missing data or zero represented incorrectly    | Domain tests plus Supabase adapter mapping tests   |
| Database shape or latest-snapshot query drifts  | pgTAP schema/query tests and adapter tests         |
| Public role can mutate demo data                | Database permission tests for denied writes        |
| Wrong blockers enter the summary                | Summary-builder validation/unit tests              |
| Summary text is incomplete or unstable          | Deterministic summary snapshot/string tests        |
| Note normalization exceeds contract             | Boundary schema and summary tests                  |
| UI implies a message was sent                   | Focused component tests and wording assertion      |
| Clipboard is unavailable or denied              | Component/browser boundary test with rejected API  |
| End-to-end wiring or responsive access fails    | One Playwright journey plus keyboard/mobile review |
| CI or production build differs from local       | Clean CI pipeline and `npm run build`              |

## Test levels

### Domain unit tests

Cover `READY`, `SHORTAGE`, `UNKNOWN`, empty requirements, precedence, mixed
shortage/unknown requirements, non-binary-exact decimal quantities, and explicit
zero. These tests import no React, Next.js, Supabase, or browser API.

### Application and adapter tests

- Query use cases are tested with a controlled readiness repository.
- Supabase mapping tests prove concrete Product identity, including Product
  Code, is retained and nullable database fields become unknown evidence instead
  of numeric zero.
- The latest Inventory Snapshot ordering is deterministic.
- The summary builder accepts only Blocking Requirements from the current
  assessment, normalizes the note, and produces exact deterministic text.
- Exact summary tests cover the fixed template, Work Package ordering, duplicate
  rejection, `Unknown` rendering, optional-note omission, and UTC ISO-8601
  timestamps.

### Database tests

Start from a clean migration and seed. Prove constraints, non-negative
quantities, relationships, Product Code uniqueness, canonical-unit ownership,
three representative Work Packages, deterministic latest-snapshot selection,
allowed public reads, and denied public insert, update, and delete.

There are no authentication, creator-isolation, RPC-write, or transactional
report tests in A2 because it performs no runtime write.

### Presentation tests

Use focused tests only for behavior not more cheaply proven below the UI:
text-based statuses, validation feedback, `Copied` wording, and the selectable
manual-copy fallback after clipboard rejection.

### Browser journey

One Playwright test runs against a clean local Supabase reset:

`list -> shortage Work Package -> evidence -> select blocker -> add note -> preview -> copy`

The test verifies the summary content and confirms the UI never claims it was
sent. Clipboard success may be stubbed deterministically; the failure fallback
is covered at the presentation boundary.

## Required quality gate

Before a work item is marked done, run its focused tests plus:

```bash
npm run format:check
npm run lint
npm run typecheck
```

Before delivery, run the complete local verification command containing:

- clean database reset and database tests;
- unit, application, adapter, and presentation tests;
- production build;
- the selected Playwright journey;
- authored-file line-limit and documentation-link checks if configured.

CI execution, deployment, and public-runtime verification are separate claims.

## Manual review

- Navigate all controls using only a keyboard.
- Review at a narrow mobile viewport and a desktop viewport.
- Confirm status is conveyed by text, not colour alone.
- Confirm Sample Data is visible without cluttering every row.
- Deny clipboard access and confirm the preview remains selectable.
- Confirm the product says `Copied`, not `Sent`, `Reported`, or `Escalated`.

## Evidence rules

Record command, date, result, and meaningful deviation in the active work item.
Do not mark planned tests as passing and do not treat a CI configuration file as
evidence of a successful remote run.
