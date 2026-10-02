# First Slice Specification: Readiness + Copy Shortage Summary

## Decision

The readiness baseline is **A2: Readiness + Copy Shortage Summary**. The accepted
[`Scenario Solution Selection`](solution-selection.md) extension adds one
persisted planning choice without changing this calculation or adding inventory
reservation.

It demonstrates the smallest coherent value path: inspect a planned Work
Package, understand whether its required Products are available, select the
Blocking Requirements, and copy an accurate plain-text Shortage Summary for use
in an existing communication channel.

## User and outcome

**Primary persona:** Team Leader preparing work before travelling to site.

**Desired outcome:** know whether the visit can proceed and, if not, leave with
a concise evidence-based summary that can be handed off without retyping.

This slice does not prove the user's real organisational role, send a
notification, create an Operations task, or track resolution.

## Working assumptions

1. The demo is publicly readable. Persisting a Selected Solution requires one
   pre-provisioned Demo Team Leader account as defined by the extension
   specification. This bounded identity does not infer a production role,
   Project membership, work ownership, or tenancy model from the brief. Direct
   table writes remain denied.
2. One Work Package represents one planned Scenario with one selected
   source-backed Solution Option from the selected Ryanfire catalogue subset.
3. Solution Options, SolutionProduct associations, option-owned Product
   Requirements, and Inventory Snapshots are independently authored synthetic
   data. The brief says the catalogue includes required products, but the
   received CSV contains no Product fields, usable Product mapping, Scenario
   eligibility, or demand quantities.
4. Each Product is a specific stock-tracked item with a unique synthetic Product
   Code, a specific name, and one canonical unit. Generic material descriptions
   and packaging units do not identify a Product. Required and available
   quantities are already expressed in the Product's canonical unit; packaging
   and conversion are excluded. First Slice quantities use at most three decimal
   places, and readiness arithmetic normalizes evidence to that scale.
5. The latest Inventory Snapshot is the available quantity for this slice. No
   reservation, warehouse, or in-transit logic is implied.
6. A copied Shortage Summary is transient. It is not stored, assigned, sent, or
   acknowledged by this application.
7. The optional note is trimmed, blank becomes absent, and the maximum length is
   500 characters.

## Demo scenario design

The First Slice is **Work Package-driven**: the Team Leader starts from planned
work, then inspects its nominated Solution and Product evidence. Solution is
context in this journey, not the navigation root or a formal bill of materials.
The internal SolutionProduct association supports readiness evidence but is not
presented as an approved catalogue or compliance decision. A Solution catalogue
journey can be designed later if a real planning user and authoritative source
are established.

The seed preserves twelve exact Solution rows selected from the received
catalogue excerpt. Four are initially selected by the six Work Packages below,
five more serve as eligible alternatives, and three remain catalogue coverage
only. Each source row is still a Solution, not a Product Requirement or
Inventory Snapshot. Products, Product Codes, mappings, Work Packages,
quantities, and Inventory Snapshots remain synthetic and do not claim that a
Product is approved or compliant for a source-backed Solution.

| Work Package                         | Product evidence                                                     | Expected result                                   |
| ------------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------- |
| Level 2 service riser firestopping   | Collar `6/10`, sealant `4/8`, board `6/20`                           | `READY` across three Product Requirements         |
| Level 3 east riser firestopping      | Collar `4/10`, sealant `6/8`, board `8/20`                           | `READY` across three Product Requirements         |
| Level 1 timber floor penetrations    | Pipe wrap `4/0`, sealant `4/8`                                       | `SHORTAGE`; one blocker and one ready requirement |
| Level 2 timber floor penetrations    | Pipe wrap `2/0`, sealant `10/8`                                      | `SHORTAGE`; two blockers                          |
| East core cable tray opening         | Sealant `12/8`, board `3/20`, plus one unmapped requirement          | `SHORTAGE` takes precedence over `UNKNOWN`        |
| Level 3 ceiling conduit penetrations | Conduit seal `6` with no snapshot, sealant with no required quantity | `UNKNOWN`; two distinct missing-evidence reasons  |

The first two Work Packages reuse one Solution, and the two timber-floor Work
Packages reuse another. This demonstrates the intended `Solution 1:N Work
Package` relationship instead of creating a unique Solution for every package.
Although the first two packages are individually `READY`, selecting them
together requires 10 sealant cartridges against one shared quantity of 8, so
Aggregate Readiness exposes a shortage of 2 without allocating it to either
package.
The five Products have specific synthetic identities such as `SC-040 Fire
Collar` and `IS-310 Intumescent Sealant 310 ml`. The
illustrative mapping keeps the 40mm collar with the Ø40mm PVC pipe context and
the sealant with pipe, cable, and conduit contexts, but it remains a synthetic
assumption rather than a technical approval. Generic material descriptions and packaging units are not
Product identities. Each Product owns one canonical unit; dependent quantities
do not repeat or convert that unit. No Product Category entity is required by
this slice.

## Boundary

### Inputs

- Work Packages and their planned dates.
- Source-backed Solutions plus synthetic Products and SolutionProduct
  associations.
- Product Requirements with required quantities.
- Latest Inventory Snapshots with available quantities and capture times.
- An explicit selection of two or more Work Packages for aggregate comparison.
- User-selected Blocking Requirements and an optional note.

### Outputs

- Work Package Material Readiness: `READY`, `SHORTAGE`, or `UNKNOWN`.
- Aggregate Readiness for selected Work Packages, grouped by Product.
- Evidence for each Product Requirement.
- A deterministic, selectable plain-text Shortage Summary.
- Clipboard feedback that distinguishes `Copied` from `Sent`.

The Shortage Summary produces no runtime write. Persisting a selected Solution
is the one separately specified write in this expanded First Slice.

## User journey

1. The Team Leader opens a table of Work Packages with visible headings,
   searches by Work Package or Solution evidence, filters by readiness status,
   and can open detail from the full visual row.
2. They may select two or more Work Packages to check whether their combined
   Product demand fits the same latest Inventory evidence.
3. They open a non-ready Work Package and inspect required, available, missing,
   and unknown evidence.
4. They choose one or more Blocking Requirements and optionally add a note.
5. The application previews a Shortage Summary built from the currently
   displayed evidence.
6. They copy the summary. If clipboard access fails, the text remains visible
   and selectable for manual copying.

## Functional requirements

### FR-1: Assess readiness

- A known requirement with `available >= required` is `READY`.
- A known requirement with `available < required` is `SHORTAGE`.
- Missing Product mapping, required quantity, or Inventory Snapshot is
  `UNKNOWN`.
- Inventory evidence is attributable only through a mapped Product. Without a
  Product mapping, available quantity and Inventory Snapshot time are unknown;
  inconsistent orphan evidence is not displayed.
- A Work Package with any `SHORTAGE` requirement is `SHORTAGE`, even if another
  requirement is `UNKNOWN`.
- Otherwise, a Work Package with any `UNKNOWN` requirement is `UNKNOWN`.
- A Work Package with no Product Requirements is `UNKNOWN` with reason
  `NO_REQUIREMENTS`.
- Only a non-empty Work Package whose requirements are all satisfied is `READY`.
- Numeric zero is valid data and is never treated as missing.

Requirement assessment follows one deterministic decision order and returns one
canonical reason code:

1. no Product mapping -> `PRODUCT_NOT_MAPPED`;
2. no required quantity -> `REQUIRED_QUANTITY_MISSING`;
3. no Inventory Snapshot -> `INVENTORY_SNAPSHOT_MISSING`;
4. available below required -> `INSUFFICIENT_QUANTITY`;
5. otherwise -> `SUFFICIENT_QUANTITY`.

Presentation maps these codes to human-readable explanations; it does not infer
different business results.

`UNKNOWN` is an evidence state, not another word for shortage or zero. It occurs
when the Product is not mapped, required quantity is missing, Inventory Snapshot
is missing, or the Work Package has no Product Requirements. Dependency
failures and missing Work Packages use explicit error/not-found states instead
of `UNKNOWN`.

### FR-2: Find and check Work Packages

- A validated, shareable `q` parameter searches Work Package name plus visible
  Solution identity and service evidence case-insensitively.
- A validated, shareable `status` parameter filters by `READY`, `SHORTAGE`, or
  `UNKNOWN`; invalid values fall back to all statuses.
- The result count distinguishes the visible results from all available Work
  Packages, and a filtered-empty state offers a direct reset.
- Applying or resetting filters clears Work Package selection so hidden records
  never continue contributing to Aggregate Readiness. Checking selected packages
  preserves the active filters.

- The Team Leader may select two or more Work Packages from the list.
- Requirements are grouped by Product and their known required quantities are
  summed once across the selection.
- Each Product's latest Inventory Snapshot is compared once against the combined
  demand; Inventory is not multiplied by the number of Work Packages.
- If combined known demand exceeds available quantity, that Product and the
  selection are `SHORTAGE` with the confirmed missing quantity.
- Missing Product mapping, required quantity, Inventory Snapshot, or a Work
  Package with no requirements remains `UNKNOWN` unless another Product already
  proves a confirmed aggregate shortage.
- Incomplete demand is displayed as `At least <known quantity>` when a known
  subtotal exists.
- The result does not reserve stock, allocate it, or decide which Work Package
  receives it. Individual Work Package statuses continue to represent each
  package considered on its own.
- Selection uses validated, shareable GET parameters. Invalid and duplicate IDs
  do not enter the calculation, and fewer than two available selections produce
  useful guidance rather than an aggregate result.

### FR-3: Explain evidence

The Work Package detail page presents two primary sections in causal order:
the nominated Solution first, then the Product Requirements assessed for that
Work Package. A known Product already demonstrates the selected Solution-to-
Product mapping, so mapped rows do not repeat the Solution identity. An unmapped
requirement makes that exceptional state explicit. The page must not imply that
a synthetic Product association proves compliance or approval.

For every requirement, show its description, mapped Product name and Product
Code when known, required quantity, available quantity, missing quantity when
calculable, canonical unit, Inventory Snapshot time when present, status, and
reason.

### FR-4: Prepare summary

- The action is available only for a Work Package with at least one `SHORTAGE`
  or `UNKNOWN` requirement.
- Only Blocking Requirements belonging to that Work Package may be selected.
- At least one Blocking Requirement must be selected.
- The summary contains Work Package name, planned date, overall readiness,
  selected evidence including Product Code where known, snapshot time where
  known, and the optional note.
- Selected blockers appear in their Work Package requirement order, independent
  of click order.
- Identical validated input produces identical text.
- Summary construction does not read or write an external service.

The plain-text structure is fixed so implementation and tests do not invent
different formats:

```text
MATERIAL SHORTAGE SUMMARY
Work Package: <name>
Planned date: <YYYY-MM-DD>
Readiness: <SHORTAGE|UNKNOWN>
Blocking requirements:
- [<SHORTAGE|UNKNOWN>] <description>
  Product: <name|Unknown>
  Product code: <product code|Unknown>
  Required: <quantity unit|Unknown>
  Available: <quantity unit|Unknown>
  Missing: <quantity unit|Unknown>
  Inventory captured: <UTC ISO-8601 timestamp|Unknown>
  Reason: <reason>

Note: <trimmed optional note>
```

The `Note` line is omitted when the normalized note is absent. Unknown values
use the exact word `Unknown`; they are never rendered as zero, an empty string,
or `N/A`. Duplicate selected requirement IDs are invalid rather than silently
normalized.

### FR-5: Copy honestly

- A successful clipboard operation is labelled `Copied` and never `Sent`,
  `Reported`, or `Escalated`.
- Clipboard failure provides useful guidance and preserves visible, selectable
  text for manual copying.
- Copying does not create a durable record or imply a recipient received it.

### FR-6: Represent UI states

Loading, empty, not-found, dependency-failure, validation, clipboard-success,
and clipboard-failure states must be explicit. None may imply readiness or
delivery when the evidence is unavailable.

## Acceptance criteria

- **AC-1:** a non-empty Work Package whose requirements are all satisfied results
  in `READY`.
- **AC-2:** at least one known deficit results in `SHORTAGE` and reports
  `required - available`, including when another requirement is `UNKNOWN`.
- **AC-3:** missing Product mapping, demand, or Inventory Snapshot results in
  `UNKNOWN` with a specific reason when no confirmed shortage exists; no Product
  Requirements results in `UNKNOWN / NO_REQUIREMENTS`.
- **AC-4:** `0` required or available is preserved as known numeric evidence.
- **AC-5:** known Product evidence contains a specific name and Product Code;
  quantities for a Product share its canonical unit and no implicit conversion
  occurs.
- **AC-6:** searching by Work Package or Solution evidence and filtering by
  readiness produce the expected shareable result set; applying filters clears
  prior selection, and no-result recovery resets the filters.
- **AC-7:** selecting two individually ready Work Packages whose combined demand
  exceeds one shared Inventory Snapshot produces an aggregate `SHORTAGE`; the
  Product total, available quantity, and missing quantity are visible without
  assigning the shortage to either package.
- **AC-8:** valid selected blockers produce the specified deterministic summary,
  including a trimmed note when supplied.
- **AC-9:** empty selection, duplicate or unrelated IDs, ready requirements,
  malformed input, and a note over 500 characters are rejected with useful
  validation.
- **AC-10:** copy success says only `Copied`; copy failure leaves a selectable
  fallback and never claims delivery.
- **AC-11:** the complete journey works with keyboard navigation and at a narrow
  mobile viewport.

## Non-functional requirements

- Supabase's anonymous runtime role has read access to required demo data but
  cannot execute the selected-Solution command. The authenticated role may
  read the same data and execute only that constrained command; direct table
  mutation remains denied.
- No service-role key is exposed to application or browser runtime.
- Untrusted route/form data is validated with Zod at its boundary.
- Domain and summary-building logic are framework-independent and unit-tested.
- The persistent header identifies the application as a demonstration. Record
  names do not repeat `DEMO`; a repeated warning banner and per-record synthetic-
  data field are unnecessary.
- Errors shown to a public user do not expose database internals or secrets.
- Persisted required and available quantities are non-negative; the domain
  calculation consumes this validated internal evidence.

## Explicit exclusions

- Self-service accounts, password recovery, user administration, production
  Team Leader role authorization, tenancy, Project membership, and work
  ownership.
- Persisted Shortage Reports, IDs, history, refresh recovery, or audit trail.
- Recipient selection, Operations inbox, assignment, notification, delivery
  confirmation, or resolution.
- Purchasing, transfers, approval of Solutions outside the eligible option set,
  crew scheduling, and field installation records.
- Live inventory, reservation, multiple locations, packaging, and unit
  conversion.
- Offline synchronization and editing.
- PDF, CSV, or other report export.

These exclusions are deliberate scope controls, not claims that the wider
product does not need them.
