# Test Strategy

## Principle

Test each risk at the cheapest boundary that can prove it, then use one browser
journey to prove that the boundaries are wired together. Do not duplicate every
domain case through React, SQL, and Playwright.

## Risk coverage

The matrix covers both implemented behavior and the accepted First Slice target.
Entries prefixed `Future` are designed test obligations, not current evidence.

| Risk                                            | Primary evidence                                   |
| ----------------------------------------------- | -------------------------------------------------- |
| Incorrect readiness precedence or quantity math | Domain unit tests                                  |
| Shared inventory counted more than once         | Aggregate readiness domain tests                   |
| Missing data or zero represented incorrectly    | Domain tests plus Supabase adapter mapping tests   |
| Database shape or latest-snapshot query drifts  | pgTAP schema/query tests and adapter tests         |
| Source Solution text is normalized or invented  | Exact-row pgTAP and adapter/presentation tests     |
| Public role can mutate data outside selection   | Denied table writes; Future command tests          |
| Unrelated or stale Solution selection persists  | Future: command, service, and database tests       |
| Product search/filter or usage count is wrong   | Product service and boundary tests                 |
| Product usage or latest Inventory maps wrongly  | Product adapter and presentation tests             |
| Wrong blockers enter the summary                | Future: summary-builder validation/unit tests      |
| Summary text is incomplete or unstable          | Future: deterministic summary string tests         |
| Note normalization exceeds contract             | Future: boundary schema and summary tests          |
| UI implies a message was sent                   | Future: component tests and wording assertion      |
| Clipboard is unavailable or denied              | Future: rejected clipboard boundary test           |
| End-to-end wiring or responsive access fails    | One Playwright journey plus keyboard/mobile review |
| CI or production build differs from local       | Clean CI pipeline and `npm run build`              |

## Test levels

### Domain unit tests

Cover `READY`, `SHORTAGE`, `UNKNOWN`, empty requirements, precedence, mixed
shortage/unknown requirements, non-binary-exact decimal quantities, and explicit
zero. Aggregate tests cover two individually ready Work Packages whose combined
demand exceeds shared inventory, incomplete demand, Product grouping, and
`SHORTAGE` precedence over `UNKNOWN`. These tests import no React, Next.js,
Supabase, or browser API.

### Application and adapter tests

- `ReadinessService` is tested with a controlled readiness repository. Tests
  prove repository constructor injection, list/detail orchestration, absent
  Work Package handling, and use of the real pure readiness calculation.
- Supabase mapping tests prove concrete Product identity, including Product
  Code, is retained and nullable database fields become unknown evidence instead
  of numeric zero.
- Readiness adapter tests prove all twelve source-backed Solution fields cross
  the database boundary without trimming, parsing, or losing literal values such
  as `-` and doubled spaces.
- The latest Inventory Snapshot ordering is deterministic.
- Future Solution-selection tests will prove option preview is side-effect free,
  an option belongs to its Work Package, repeated selection is idempotent, and a
  stale expected-current option becomes a structured conflict.
- `ProductService` tests prove trimmed case-insensitive search, usage and
  Inventory-evidence filters, combinations, deterministic ordering, and unique
  referencing-Work-Package counts without hiding duplicate requirements.
- Product boundary tests prove malformed IDs, multi-valued query input, invalid
  enums, whitespace, and overlong search values cannot reach the repository
  unchecked. Product adapter tests prove ordered reverse usage, numeric zero,
  missing evidence, and the equal-time snapshot ID tie-break.
- Future summary-builder tests will accept only Blocking Requirements from the
  current assessment, normalize the note, and prove exact deterministic text,
  Work Package ordering, duplicate rejection, `Unknown` rendering, optional-note
  omission, and UTC ISO-8601 timestamps.

### Database tests

Start from a clean migration and seed. Prove constraints, non-negative
quantities, relationships, Product Code uniqueness, canonical-unit ownership,
the twelve exact source-backed Solution rows, four mapped and eight
catalogue-only Solutions, the six-Work-Package multi-Product scenario matrix,
deterministic latest-snapshot selection,
allowed public reads, and denied public insert, update, and delete. Future
Solution-selection database tests will prove execution of only the constrained
command.

There are no authentication, creator-isolation, reservation, or stock-allocation
tests. The demonstration assumes the visitor is the Team Leader; database tests
must not imply that this is production authorization.

### Presentation tests

Use focused tests only for behavior not more cheaply proven below the UI:
text-based statuses, validation feedback, `Copied` wording, and the selectable
manual-copy fallback after clipboard rejection. Product presentation tests
cover navigation, GET controls, known/unknown/zero Inventory evidence,
filtered-empty recovery, and requirement-level Work Package links. Aggregate
presentation tests cover Work Package selection, the two-package minimum,
Product totals, and the explicit no-reservation/no-allocation boundary.
Future Solution Option presentation tests will cover preview, confirmation,
successful selection, dependency failure, stale-write conflict, and the explicit
statement that choosing a Solution does not reserve inventory.

### Browser journeys

The currently implemented Playwright journeys cover:

- selecting the two individually ready riser Work Packages and proving that
  their shared sealant demand is displayed as `10 cartridge` required, `8
cartridge` available, and `2 cartridge` missing; and
- navigating between Product detail sections without introducing vertical page
  overflow.

These tests protect concrete route and responsive behavior without repeating
every domain case.

A future Shortage Summary journey will cover:

`list -> shortage Work Package -> evidence -> select blocker -> add note -> preview -> copy`

It will verify summary content and confirm the UI never claims it was sent.
Clipboard success may be stubbed deterministically; the failure fallback belongs
at the presentation boundary.

A future Solution-selection journey will preview an eligible option, persist it,
observe the recalculated Work Package status and requirements, and verify that
Product usage and Aggregate Readiness consume the same selected option.

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
- Confirm the demonstration context remains clear without repeated warning
  text, per-row labels, or `DEMO` identity prefixes.
- Deny clipboard access and confirm the preview remains selectable.
- Confirm the product says `Copied`, not `Sent`, `Reported`, or `Escalated`.
- Compare and select a Solution Option using only the keyboard, then confirm the
  page communicates that no inventory was reserved.

## Evidence rules

Record command, date, result, and meaningful deviation in the active work item.
Do not mark planned tests as passing and do not treat a CI configuration file as
evidence of a successful remote run.
