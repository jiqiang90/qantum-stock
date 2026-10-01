# Glossary

Use these terms consistently across product copy, code, tests, database names,
and documentation. Add a term here before introducing a competing synonym.

| Canonical term             | Meaning                                                                                         | Do not use as a synonym            |
| -------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------- |
| Team Leader                | The target persona preparing work before travel. A2 does not authenticate or authorize the role | Demo Actor, Current Actor          |
| Solution                   | A passive-fire system or catalogue solution                                                     | Product, material                  |
| Product                    | A stock-tracked material required by planned work                                               | Solution                           |
| Work Package               | A unit of planned site work assessed for Material Readiness                                     | job, task, report                  |
| Product Requirement        | The required quantity of a Product, or an unresolved Product need, for a Work Package           | inventory item                     |
| Inventory Snapshot         | Available quantity for a Product observed at a stated time                                      | stock truth, live inventory        |
| Material Readiness         | Evidence-based state of a Work Package: `READY`, `SHORTAGE`, or `UNKNOWN`                       | compliance, approval               |
| Blocking Requirement       | A Product Requirement assessed as `SHORTAGE` or `UNKNOWN`                                       | failed Product                     |
| Shortage Summary           | Transient plain text built from selected Blocking Requirements and an optional note             | report, escalation, notification   |
| Prepare shortage summary   | Select blockers, add an optional note, and preview a Shortage Summary                           | report shortage, raise escalation  |
| Copy summary               | Write the visible Shortage Summary to the clipboard                                             | send, submit, notify               |
| Escalate material shortage | Future Team Leader action that creates a durable Material Shortage Notice                       | copy summary                       |
| Material Shortage Notice   | Future persistent Project record coordinated by the Project Manager                             | generic escalation, copied summary |
| Action Plan                | Future confirmed Project response that tells the Team Leader how affected work will proceed     | notification, acknowledgement      |
| Sample Data                | Independently authored synthetic data used by the public demonstration                          | supplied data, production data     |
| First Slice                | The smallest end-to-end user outcome selected for this submission                               | whole MVP, complete product        |
| Production Gap             | A real unresolved need that requires operational evidence or a later product decision           | implemented capability             |
| Alternative Solution       | A proposed substitute that still requires a separate technical/compliance decision              | approved equivalent                |

## Quantity semantics

- Each Product owns one `canonicalUnit`.
- `requiredQuantity` and `availableQuantity` are expressed in that unit.
- `missingQuantity` is `max(requiredQuantity - availableQuantity, 0)` only when
  both operands are known.
- `0` is known numeric evidence; `null`/absence means unknown.
- Packaging and unit conversion are Production Gaps, not hidden arithmetic.

## Status precedence

At Work Package level, `SHORTAGE` takes precedence over `UNKNOWN`, which takes
precedence over `READY`. A confirmed shortage already proves that the planned
work is not ready; unknown evidence remains visible per requirement. A Work
Package with no Product Requirements is `UNKNOWN / NO_REQUIREMENTS`.
