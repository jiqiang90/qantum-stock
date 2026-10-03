# Source-backed Solution Catalogue Subset

- Status: Approved
- Approved: Yes
- Iteration: 2
- Last updated: 2026-10-02
- Repo: `passivefire`
- Domain: Material Readiness

## Summary

Replace the four invented Solution summaries in the demo database with twelve
exact records selected from the supplied Ryanfire catalogue excerpt. Keep only
the operational data absent from that excerpt—Work Packages, Product mappings,
required quantities, and Inventory Snapshots—as explicit synthetic assumptions.

This corrects provenance and provides representative catalogue breadth without
turning all 148 records into unused runtime data or treating similar catalogue
rows as interchangeable.

## Decision

Use a twelve-record source-backed subset rather than an entirely synthetic
catalogue or a full 148-row import.

- Preserve the selected rows' 12 supplied fields without normalizing away raw
  values.
- Use the pair `supplier + internal_code` as the catalogue identity and retain
  `supplier_ref_code` as a separate supplier reference.
- Keep a UUID primary key for application relationships.
- Derive concise display copy from source fields instead of storing an invented
  Solution name.
- Keep every selected catalogue row distinct. Similar visible conditions do not
  prove that supplier references are interchangeable.
- Do not make the ignored source CSV a runtime or CI dependency. The selected
  values are versioned in the seed and protected by database scenario tests.
- The take-home explicitly supplies the catalogue and requires a public code and
  front-end submission, so this exercise assumes the bounded selected subset may
  be included for assessment. Confirm that assumption before reusing the data
  outside this submission context.

## Selected source records

| Internal Code | Supplier Ref. Code        | Supplier | Orientation | Substrate                                                | Service Classification | Service Type                     | Size   | Integrity | Insulation | Service Type Option      | Substrate Option     | Runtime use                                    |
| ------------- | ------------------------- | -------- | ----------- | -------------------------------------------------------- | ---------------------- | -------------------------------- | ------ | --------- | ---------- | ------------------------ | -------------------- | ---------------------------------------------- |
| `0444`        | `V21.2-21SFR00051-98-A`   | Ryanfire | Wall        | FR plasterboard, FR plasterboard wall (1 layer 13mm)     | Combustible Pipe       | PVC Pipe                         | Ø40mm  | 60        | 60         | PVC Pipe                 | Plasterboard Wall    | Level 2 service riser; Level 3 east riser      |
| `0485`        | `V22.11-PF 19060-74-B`    | Ryanfire | Floor       | Timber Infill, 100mm timber infill floor                 | Combustible Pipe       | PVC Pipe                         | Ø50mm  | 90        | 90         | PVC Pipe                 | Timber Infill Floor  | Level 1 and Level 2 timber-floor Work Packages |
| `0659`        | `V27.8-PF 19010-62-15`    | Ryanfire | Wall        | FR plasterboard, FR plasterboard wall (1 layer 13mm)     | Electrical Penetration | Cable Tray D1                    | 300mm  | 60        | 60         | Cable Tray               | Plasterboard Wall    | East core cable-tray Work Package              |
| `0510`        | `V22.35-22SFR00072-181-C` | Ryanfire | Ceiling     | FR plasterboard, FR plasterboard ceiling (1 layer 16mm)  | Electrical Penetration | PVC Conduit                      | Ø25mm  | 60        | 60         | PVC Conduit              | Plasterboard Ceiling | Level 3 ceiling-conduit Work Package           |
| `0334`        | `V1.11-22SFR00038-146-E`  | Ryanfire | Wall        | FR plasterboard, FR plasterboard wall (1 layer 13mm)     | Non-Combustible Pipe   | Copper Pipe                      | Ø100mm | 60        | `-`        | Copper Pipe              | Plasterboard Wall    | Catalogue coverage only                        |
| `0375`        | `V15.1-21SFR00018-130-D`  | Ryanfire | Wall        | FR plasterboard, FR plasterboard wall (2 layers 13mm)    | Insulated Pipe         | `Copper Pipe  - 50mm Fibreglass` | Ø32mm  | 60        | 60         | Insulated Copper Pipe    | Plasterboard Wall    | Catalogue coverage only                        |
| `0521`        | `V22.44-22SFR00074-171-C` | Ryanfire | Floor       | Concrete, 125mm concrete floor                           | Combustible Pipe       | PVC Pipe                         | Ø100mm | 60        | 60         | PVC Pipe                 | Concrete Floor       | Alternative: Level 2 timber floor              |
| `0512`        | `V22.36-23SFR00075-234-G` | Ryanfire | Floor       | CLT, 103mm CLT floor                                     | Combustible Pipe       | PVC Pipe                         | Ø80mm  | 60        | 60         | PVC Pipe                 | CLT Floor            | Alternative: Level 1 timber floor              |
| `0455`        | `V21.30-22SFR00073-184-B` | Ryanfire | Wall        | KOROK®, KOROK® wall (78mm)                               | Combustible Pipe       | PVC Pipe                         | Ø65mm  | 120       | 120        | PVC Pipe                 | Korok Wall           | Alternative: Level 2 service riser             |
| `0677`        | `V29.24-21SFR00057-105-A` | Ryanfire | Ceiling     | FR plasterboard, FR plasterboard ceiling (1 layer 16mm)  | Electrical Penetration | Cable Bundle TPS                 | Ø100mm | 60        | 60         | Cable (Single or Bundle) | Plasterboard Ceiling | Alternatives: east core and ceiling            |
| `0470`        | `V21.42-23SFR00089-280-I` | Ryanfire | Wall        | AFS Logicwall®, AFS Logicwall®                           | Combustible Pipe       | PVC Pipe                         | Ø65mm  | 120       | 120        | PVC Pipe                 | AFS Logic Wall       | Alternative: Level 3 east riser                |
| `0918`        | `V64.20-23SFR00097-266-B` | Ryanfire | Wall        | FR plasterboard, 190mm Glulam timber beam (1 layer 19mm) | Structural Penetration | Timber Beam                      | 190mm  | 120       | 120        | Timber Beam              | Plasterboard Wall    | Catalogue coverage only                        |

All values above come from `data/solutions-excerpt.csv`. Four records are the
initial selections, five more support the eligible-alternative journey, and
three remain catalogue-only. Eligibility and Product mappings are synthetic
operational assumptions, not source or compliance evidence.

## Scope

### In scope

- Expand the `solutions` table to preserve the selected source fields.
- Replace the four invented Solution records with the twelve exact rows above.
- Initially select four source-backed Solutions across six Work Packages. Add
  one independently authored alternative per Work Package. Nine Solutions have
  synthetic Product mappings; three intentionally remain catalogue-only.
- Expose a concise Solution reference and conditions in Work Package list/detail
  views without creating a Solution Explorer.
- Reduce inconsistent synthetic Product data:
  - change the collar identity and variant from 100mm to 40mm for Solution
    `0444`;
  - remove the collar requirement from the Ø50mm timber-floor Solution;
  - remove the cable-pillow Product and requirement from the PVC-conduit
    Solution;
  - retain the existing aggregate contention scenario for the two riser Work
    Packages.
- Update documentation and tests to distinguish source-backed catalogue fields
  from synthetic operational fields.

### Out of scope

- Importing all 148 catalogue rows.
- Solution list, search, filter, comparison, administration, or approval UI.
- Inferring required Products from service or substrate fields.
- Claiming that a selected Solution is approved for a Project or installation.
- Treating matching catalogue fields as proof that two Solutions are duplicates
  or substitutes.
- Introducing live Product, inventory, delivery, reservation, or scheduling
  data.

## Target data contract

`Solution` stores:

- application UUID;
- Internal Code;
- Supplier Ref. Code;
- Supplier;
- Orientation;
- raw Substrate;
- Service Classification;
- raw Service Type;
- Service Size;
- Integrity;
- Insulation;
- Service Type Option;
- Substrate Option.

The source represents fire-resistance values as catalogue text, including `-`.
The First Slice preserves those values rather than assigning an unsupported
numeric or missing-data meaning.

The following remain synthetic because the supplied excerpt does not contain
them:

- Work Package identity, name, and planned date;
- Solution-to-Product mapping;
- Product identity and profile;
- Product Requirement quantity;
- Inventory Snapshot quantity and capture time.

## Presentation

- Work Package tables show a compact label derived from source data, for
  example `Ryanfire 0444 · PVC Pipe Ø40mm · Plasterboard Wall · 60/60`.
- Work Package detail shows Internal Code and Supplier Ref. Code plus the main
  installation conditions.
- Full raw substrate text remains available on detail but does not compete with
  readiness evidence for page priority.
- The UI does not add repeated source or synthetic-data warnings; the README
  and reviewer documentation carry the demonstration boundary.

## Alternatives and trade-offs

### Import all 148 records

Rejected for this slice. There is no Solution discovery journey, and 144 unused
rows would increase seed and test surface without improving the selected user
outcome.

### Keep only the four operationally used records

Rejected after review. It is sufficient for the current readiness journey but
does not demonstrate the breadth of the supplied catalogue. Eight additional
source-backed records add meaningful variety without requiring more mock
operational data.

### Keep the four invented Solution summaries

Rejected. It ignores supplied source data, loses catalogue identity and test
references, and makes the solution conditions less defensible in an interview.

### Deduplicate visually matching records

Rejected. The file has no duplicate complete rows, but five pairs share the
same visible raw technical fields and eleven pairs share normalized conditions.
Different Internal Codes and Supplier Ref. Codes may represent distinctions not
present in the excerpt.

## Success criteria

- Exactly twelve seeded Solutions match the selected CSV records field for
  field.
- Each Work Package references the intended source-backed Solution.
- No invented Solution name remains in persistence.
- Product, quantity, and inventory assumptions remain clearly separate from
  source catalogue fields.
- The two riser Work Packages remain individually `READY`; their combined
  sealant demand remains `10 cartridge` against `8 cartridge`, producing a
  missing quantity of `2 cartridge`.
- Work Package list/detail pages display useful Solution provenance without
  adding a Solution management capability or overwhelming readiness evidence.

These criteria describe the PF-003A baseline. The implemented PF-004B
[`Scenario Solution Selection`](solution-selection.md) extension associates
additional rows from the same twelve-record subset with Work Packages and adds
synthetic option-specific Product mappings. It does not change any preserved
catalogue field or treat those new associations as source evidence.

## Test strategy

- Database schema tests cover required fields, non-blank constraints, and
  supplier-scoped identity uniqueness.
- Database scenario tests assert the twelve exact source rows, nine Solutions
  with operational mappings, three catalogue-only records, and twelve eligible
  options.
- Adapter tests prove every source field maps without renaming or losing `-`.
- Presentation tests cover the derived compact label and detail metadata.
- Existing readiness, aggregate, Product Explorer, public-read policy, build,
  and browser tests remain regression gates.

## Risks and mitigations

- **Risk:** source-backed Solution data may make synthetic Product mappings look
  supplier-authoritative. **Mitigation:** keep Product mappings explicitly
  synthetic in the spec and avoid Ryanfire branding on Product identity.
- **Risk:** deriving a display label could hide raw differences. **Mitigation:**
  preserve all raw fields and show the supplier reference and raw substrate on
  detail.
- **Risk:** similar records could be collapsed accidentally. **Mitigation:**
  retain supplier-scoped source identities and test that each selected record is
  distinct.
- **Risk:** data correction breaks the aggregate demonstration. **Mitigation:**
  preserve the first two Work Package quantities and add a browser assertion for
  the existing `10 / 8 / 2` sealant result.

## Open questions

None for this bounded subset. A future Solution Explorer would require a
separate decision about loading the full catalogue and its update process.

## Runtime and verification

- Start database: `npm run db:start`
- Recreate data: `npm run db:reset`
- Database checks: `npm run db:test` and local Supabase schema lint
- Application checks: `npm run check`
- Browser checks: `npm run test:e2e`

No authentication, write path, new secret, external service, or deployment
change is introduced.
