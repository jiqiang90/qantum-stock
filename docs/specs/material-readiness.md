# First Slice Specification: Readiness + Copy Shortage Summary

## Decision

The accepted First Slice is **A2: Readiness + Copy Shortage Summary**.

It demonstrates the smallest coherent value path: inspect a planned Work
Package, understand whether its required Products are available, select the
Blocking Requirements, and copy an accurate plain-text Shortage Summary for use
in an existing communication channel.

## User and outcome

**Primary persona:** Team Leader preparing work before travelling to site.

**Desired outcome:** know whether the visit can proceed and, if not, leave with
a concise evidence-based summary that can be handed off without retyping.

This slice does not prove the user's real role, send a notification, create an
Operations task, or track resolution.

## Working assumptions

1. The demo is public and read-only; no production Team Leader identity or
   tenancy model is inferred from the brief.
2. One Sample Work Package represents one planned scenario using one nominated
   synthetic Solution.
3. Product Requirements and Inventory Snapshots are independently authored
   Sample Data because the supplied CSV contains no usable Product mapping or
   demand quantities.
4. Each Product has one canonical unit. Required and available quantities are
   already expressed in it; packaging and conversion are excluded.
5. The latest Inventory Snapshot is the available quantity for this slice. No
   reservation, warehouse, or in-transit logic is implied.
6. A copied Shortage Summary is transient. It is not stored, assigned, sent, or
   acknowledged by this application.
7. The optional note is trimmed, blank becomes absent, and the maximum length is
   500 characters.

## Boundary

### Inputs

- Sample Work Packages and their planned dates.
- Synthetic Solutions and Products.
- Product Requirements with required quantities.
- Latest Inventory Snapshots with available quantities and capture times.
- User-selected Blocking Requirements and an optional note.

### Outputs

- Work Package Material Readiness: `READY`, `SHORTAGE`, or `UNKNOWN`.
- Evidence for each Product Requirement.
- A deterministic, selectable plain-text Shortage Summary.
- Clipboard feedback that distinguishes `Copied` from `Sent`.

No runtime write is produced.

## User journey

1. The Team Leader opens a list of Sample Work Packages and sees a text readiness
   status for each one.
2. They open a non-ready Work Package and inspect required, available, missing,
   and unknown evidence.
3. They choose one or more Blocking Requirements and optionally add a note.
4. The application previews a Shortage Summary built from the currently
   displayed evidence.
5. They copy the summary. If clipboard access fails, the text remains visible
   and selectable for manual copying.

## Functional requirements

### FR-1: Assess readiness

- A known requirement with `available >= required` is `READY`.
- A known requirement with `available < required` is `SHORTAGE`.
- Missing Product mapping, required quantity, or Inventory Snapshot is
  `UNKNOWN`.
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

### FR-2: Explain evidence

For every requirement, show its description, mapped Product when known, required
quantity, available quantity, missing quantity when calculable, canonical unit,
Inventory Snapshot time when present, status, and reason.

### FR-3: Prepare summary

- The action is available only for a Work Package with at least one `SHORTAGE`
  or `UNKNOWN` requirement.
- Only Blocking Requirements belonging to that Work Package may be selected.
- At least one Blocking Requirement must be selected.
- The summary contains Work Package name, planned date, overall readiness,
  selected evidence, snapshot time where known, and the optional note.
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
Data: Sample Data demonstration

Blocking requirements:
- [<SHORTAGE|UNKNOWN>] <description>
  Product: <name|Unknown>
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

### FR-4: Copy honestly

- A successful clipboard operation is labelled `Copied` and never `Sent`,
  `Reported`, or `Escalated`.
- Clipboard failure provides useful guidance and preserves visible, selectable
  text for manual copying.
- Copying does not create a durable record or imply a recipient received it.

### FR-5: Represent UI states

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
- **AC-5:** quantities for a Product share its canonical unit; no implicit
  conversion occurs.
- **AC-6:** valid selected blockers produce the specified deterministic summary,
  including a trimmed note when supplied.
- **AC-7:** empty selection, duplicate or unrelated IDs, ready requirements,
  malformed input, and a note over 500 characters are rejected with useful
  validation.
- **AC-8:** copy success says only `Copied`; copy failure leaves a selectable
  fallback and never claims delivery.
- **AC-9:** the complete journey works with keyboard navigation and at a narrow
  mobile viewport.

## Non-functional requirements

- Supabase's public runtime role has read-only access to the required demo data.
- No service-role key is exposed to application or browser runtime.
- Untrusted route/form data is validated with Zod at its boundary.
- Domain and summary-building logic are framework-independent and unit-tested.
- Sample Data is disclosed once at page/layout level instead of repeated as a
  field on every database record.
- Errors shown to a public user do not expose database internals or secrets.

## Explicit exclusions

- Authentication, Team Leader role authorization, tenancy, and work ownership.
- Persisted Shortage Reports, IDs, history, refresh recovery, or audit trail.
- Recipient selection, Operations inbox, assignment, notification, delivery
  confirmation, or resolution.
- Purchasing, transfers, alternative selection/approval, crew scheduling, and
  field installation records.
- Live inventory, reservation, multiple locations, packaging, and unit
  conversion.
- Offline synchronization and editing.
- PDF, CSV, or other report export.

These exclusions are deliberate scope controls, not claims that the wider
product does not need them.
