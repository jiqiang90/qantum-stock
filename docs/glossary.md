# Glossary

Use these terms consistently across product copy, code, tests, database names,
and documentation. Add a term here before introducing a competing synonym.

| Canonical term               | Meaning                                                                                     | Do not use as a synonym              |
| ---------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------ |
| Team Leader                  | The target persona preparing work before travel                                             | Demo Actor, Current Actor            |
| Demo Team Leader             | The one pre-provisioned authenticated account allowed to persist a Selected Solution        | production Team Leader, admin        |
| Solution                     | A passive-fire system or catalogue solution                                                 | Product, material                    |
| Internal Code                | The source catalogue's supplier-scoped internal identifier for a Solution                   | Product Code                         |
| Supplier Ref. Code           | The supplier reference retained as Solution provenance; it is not a Product identifier      | Supplier Product Code                |
| Product                      | A specific, uniquely identifiable stock-tracked item required by planned work               | Solution, generic material type      |
| Product Code                 | The Product-specific stock identifier; synthetic in this demo                               | Solution code, Supplier Ref. Code    |
| Product Category             | A flat Product-owned classification used for discovery and display                          | Solution classification              |
| Product Variant              | The Product's specific size, volume, or supplied format                                     | canonical unit                       |
| Manufacturer                 | The organisation identified as making the Product; synthetic in this demo                   | supplier, Solution supplier          |
| Supplier Product Code        | The supplier-facing identifier for the Product; synthetic in this demo                      | Product Code, Supplier Ref. Code     |
| Work Package                 | One planned installation Scenario assessed for Material Readiness                           | job, task, report                    |
| Solution Option              | A source-backed Solution explicitly made eligible for one Work Package Scenario             | catalogue match, approved equivalent |
| Selected Solution            | The persisted Solution Option currently nominated for a Work Package                        | reserved Solution                    |
| SolutionProduct              | Internal association declaring that a Product belongs to a Solution's required Product set  | Product, approval                    |
| Product Requirement          | Work Package demand referencing a SolutionProduct, or an unresolved Product need            | inventory item                       |
| Inventory Snapshot           | Available quantity for a Product observed at a stated time                                  | stock truth, live inventory          |
| Material Readiness           | Evidence-based state of a Work Package: `READY`, `SHORTAGE`, or `UNKNOWN`                   | compliance, approval                 |
| Combined Availability Check  | Team Leader workflow that compares the combined demand of explicitly selected Work Packages | reservation, allocation              |
| Combined Availability Report | Transient on-screen result of a Combined Availability Check, grouped by Product             | reservation confirmation, allocation |
| Aggregate Readiness          | Domain calculation that supplies a Combined Availability Report                             | reservation, allocation              |
| Blocking Requirement         | A Product Requirement assessed as `SHORTAGE` or `UNKNOWN`                                   | failed Product                       |
| Shortage Summary             | Transient plain text built from selected Blocking Requirements or combined Product totals   | report, escalation, notification     |
| Prepare shortage summary     | Preview a Shortage Summary from a Work Package or Combined Availability Report              | report shortage, raise escalation    |
| Copy summary                 | Write the visible Shortage Summary to the clipboard                                         | send, submit, notify                 |
| Escalate material shortage   | Future Team Leader action that creates a durable Material Shortage Notice                   | copy summary                         |
| Material Shortage Notice     | Future persistent Project record routed to an accountable coordinator                       | generic escalation, copied summary   |
| Action Plan                  | Future confirmed Project response that tells the Team Leader how affected work will proceed | notification, acknowledgement        |
| Synthetic Data               | Independently authored non-production data used by the public demonstration                 | supplied data, production data       |
| Source-backed Solution Data  | Exact Solution fields selected from the supplied catalogue and versioned in the demo seed   | Product mapping, approval evidence   |
| First Slice                  | The smallest end-to-end user outcome selected for this submission                           | whole MVP, complete product          |
| Production Gap               | A real unresolved need that requires operational evidence or a later product decision       | implemented capability               |
| Alternative Solution         | A proposed substitute not yet eligible as a Solution Option and requiring separate review   | Solution Option, approved equivalent |

## Quantity semantics

- Generic descriptions such as `Fire Collar` and `Fire Sealant` do not identify
  a Product. A specific name and Product Code do; `each` and `cartridge` are
  units.
- Each Product owns one `canonicalUnit`.
- Product Category, Product Variant, Manufacturer, and Supplier Product Code
  describe the Product. They do not establish compatibility with a Solution.
- `requiredQuantity` and `availableQuantity` are expressed in that unit.
- First Slice quantities use at most three decimal places; comparison and
  subtraction normalize to that scale rather than exposing floating-point
  artefacts.
- `missingQuantity` is `max(requiredQuantity - availableQuantity, 0)` only when
  both operands are known.
- `0` is known numeric evidence; `null`/absence means unknown.
- Packaging and unit conversion are Production Gaps, not hidden arithmetic.

## Status precedence

At Work Package level, `SHORTAGE` takes precedence over `UNKNOWN`, which takes
precedence over `READY`. A confirmed shortage already proves that the planned
work is not ready; unknown evidence remains visible per requirement. A Work
Package with no Product Requirements is `UNKNOWN / NO_REQUIREMENTS`.

Aggregate Readiness uses the same precedence after grouping known demand by
Product and comparing that combined demand with shared inventory once. The
result is presented as a Combined Availability Report. It does not reserve
stock, allocate stock, or modify individual Work Package readiness.

`UNKNOWN` means the material evidence is insufficient to decide readiness. It
does not mean zero stock, a confirmed shortage, a missing Work Package, or a
database/dependency failure.
