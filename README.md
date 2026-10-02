# Passivefire Material Readiness

This project explores a focused Team Leader journey for QAntum: understand
whether a planned passive-fire Work Package has the required materials and, when
it does not, prepare a clear Shortage Summary that can be copied into an existing
business communication channel before travelling to site.

## Current status

The application foundation, local quality tooling, baseline GitHub Actions run,
Material Readiness calculation, reproducible local Supabase schema, the Work
Package list/detail evidence view, and multi-package aggregate check are
implemented and verified. A
read-only Product Explorer with URL-backed search, evidence filters, Product
detail, and reverse Work Package usage is also demonstrated against local
demo data. Twelve Solution records preserve fields from the supplied Ryanfire
catalogue excerpt; Work Packages, Product mappings, quantities, and inventory
remain synthetic assumptions. The Shortage Summary interaction,
persisted Solution selection, database/browser CI stages, and public deployment
are not yet implemented.

## Quick start

Use Node.js 22.22.0 (the version recorded in `.nvmrc`) and npm 10.9.4. If nvm is
available, select the recorded Node version first.

```bash
nvm use # optional when nvm is installed
npm ci
npm run dev
```

Open `http://localhost:3000`.

- `/` lists Work Packages and their Material Readiness.
- Select two or more Work Packages on `/` to compare their combined Product
  demand with shared Inventory evidence.
- `/products` lists Products and links to their Inventory and Work
  Package usage evidence.

Local database development also requires Docker. Recreate the demonstration
data model from its migration and seed with:

```bash
npm run db:start
npm run db:reset
npm run db:test
```

Local Supabase Studio is available at `http://127.0.0.1:54323`. Run
`npm run db:types` after a schema change, and stop the local stack with
`npm run db:stop` when it is no longer needed.

## Quality commands

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
npx playwright install chromium # first run on a new machine
npm run test:e2e
```

Run `npm run check` for the application quality gate. Playwright covers the
selected-Work-Package aggregate journey and Product section overflow; database
tests remain a separate `npm run db:test` gate.

Before running the Supabase-backed UI, copy `.env.example` to `.env.local` and
populate it with the local or hosted public Supabase URL and publishable key.
No service-role credential is required by the application.

## Reviewer guide

The shortest review path is Product Overview -> First Slice Specification ->
Technical Design -> Test Strategy -> Agent-assisted Approach.

| Document                                                                         | Purpose                                                                         |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [`docs/product/overview.md`](docs/product/overview.md)                           | Business context, evidence gaps, wider workflow, roadmap, and capability status |
| [`docs/specs/material-readiness.md`](docs/specs/material-readiness.md)           | First Slice assumptions, requirements, acceptance criteria, and exclusions      |
| [`docs/specs/solution-selection.md`](docs/specs/solution-selection.md)           | Eligible Solution preview, persisted selection, and no-reservation boundary     |
| [`docs/specs/product-explorer.md`](docs/specs/product-explorer.md)               | Supporting read-only Product discovery and reverse-usage contract               |
| [`docs/specs/source-backed-solutions.md`](docs/specs/source-backed-solutions.md) | Supplied Solution subset and synthetic operational-data boundary                |
| [`docs/architecture/overview.md`](docs/architecture/overview.md)                 | First Slice boundaries, read flow, data model, and security invariants          |
| [`docs/quality/test-strategy.md`](docs/quality/test-strategy.md)                 | Risk-based test coverage and delivery quality gate                              |
| [`docs/engineering/agent-approach.md`](docs/engineering/agent-approach.md)       | How coding agents are guided, challenged, corrected, and verified               |

[`docs/README.md`](docs/README.md) maps authority boundaries. The glossary,
ADRs, `AGENTS.md`, and `tasks/` are supporting definitions, agent instructions,
decisions, and execution evidence.

## Planned demo scenario

1. Open a Work Package and compare its eligible Solution Options.
2. Preview and persist a different selected Solution, then inspect its
   recalculated `READY`, `SHORTAGE`, or `UNKNOWN` evidence.
3. Select `Level 2 service riser firestopping` and `Level 3 east riser
firestopping`. Their aggregate view exposes shared demand without reserving
   inventory.
4. Open a package marked `SHORTAGE`, select its Blocking Requirements, and add an
   optional note.
5. Preview and copy a deterministic Shortage Summary.
6. Observe that the product says `Copied`, not `Sent`, and retains selectable
   text if clipboard access is unavailable.

Solution selection is planned in PF-004B. Aggregate Readiness is implemented by
PF-004. The Shortage Summary steps are the PF-005 boundary and are not yet
implemented.

The supporting Product Explorer can be reviewed independently by opening
`/products`, applying a search or evidence filter, then following a Product to
its referencing Work Packages. It does not expand the accepted A2 journey or
claim Product administration, location, reservation, or compliance semantics.

## Data and limitations

- Supabase Postgres is the runtime source of truth and local Supabase is the
  repeatable development/test environment.
- The currently implemented surface is read-only. PF-004B adds only a constrained
  selected-Solution write and assumes the visitor is the Team Leader. It does
  not reserve inventory or provide production authentication.
- The designed Shortage Summary will be copied into an existing business
  channel chosen by the user; that interaction is not implemented yet.
- The supplied exercise brief and `data/solutions-excerpt.csv` catalogue are
  ignored local reference material and are not committed or required at runtime.
- The seed preserves twelve selected Solution rows from the supplied catalogue,
  including their Internal Code, Supplier Ref. Code, conditions, and
  fire-resistance text. This bounded subset is therefore present in repository
  history; the complete CSV remains ignored and is not a runtime or CI
  dependency.
- Work Packages, Products, SolutionProduct mappings, quantities, and Inventory
  Snapshots are independently authored synthetic operational data. The
  persistent header identifies the application as a demonstration without
  repeating `DEMO` on every row.
- Product profiles include synthetic category, manufacturer, supplier-facing
  code, variant, and description fields so Product detail remains useful without
  copying Solution catalogue attributes.

The brief establishes that catalogue Solutions include required Products, but
the received CSV contains no Product identifier, Product name, SKU, or usable
Solution-to-Product mapping. Its internal and supplier reference codes identify
Solutions. The runtime therefore preserves a bounded source-backed Solution
subset and introduces explicitly synthetic SolutionProduct mappings, Work
Packages, quantities, and inventory. A Product
Requirement can reference only a Product declared for its Solution Option; one
unresolved mapping remains to demonstrate `UNKNOWN`. These mappings and option
eligibility are planning assumptions, not evidence that a catalogue match has
received compliance approval.
