# Passivefire Material Readiness

This project explores a focused Team Leader journey for QAntum: understand
whether a planned passive-fire Work Package has the required materials and, when
it does not, prepare a clear Shortage Summary that can be copied into an existing
business communication channel before travelling to site.

## Current status

The application foundation, local quality tooling, baseline GitHub Actions run,
Material Readiness calculation, reproducible local Supabase schema, the Work
Package list/detail evidence view, multi-package aggregate check, eligible
Solution preview and authenticated selection are implemented and locally
verified. A
read-only Product Explorer with URL-backed search, evidence filters, Product
detail, and reverse Work Package usage is also demonstrated against local
demo data. Twelve Solution records preserve fields from the supplied Ryanfire
catalogue excerpt; Work Packages, Product mappings, quantities, and inventory
remain synthetic assumptions. Single-package and combined Shortage Summary
interactions are implemented and locally verified. The hosted schema and
synthetic data have been provisioned; hosted reviewer credentials, automated
browser CI, and public deployment evidence are not yet complete.

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
- Choose `Check combined availability` on `/`, then select two or more Work
  Packages to compare their combined Product demand with shared Inventory
  evidence.
- Open a non-ready Work Package to select Blocking Requirements, add an optional
  note, and preview or copy its Shortage Summary.
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

Run `npm run check` for the application quality gate. Playwright covers public
Solution preview, authenticated selection, the selected-Work-Package aggregate
journey, single-package and combined Shortage Summary copying, narrow-screen
layout, and Product section overflow; database tests remain a separate
`npm run db:test` gate.

Before running the Supabase-backed UI, copy `.env.example` to `.env.local` and
populate it with the local or hosted public Supabase URL and publishable key.
No service-role credential is required by the application.

## Delivery workflow

GitHub `CI` runs the application quality gate. A separate `Deploy` workflow can
be started manually, or automatically after `CI` succeeds for a push to `main`.
The automatic path deploys the exact CI revision through the Vercel REST API;
the manual path is limited to `main` and reruns `npm run check` first. Both
finish with an HTTP smoke check of the Work Package list at `/`.

Configure `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` as secrets in
the GitHub `production` Environment. Public Supabase runtime variables remain in
Vercel and no privileged Supabase credential belongs in GitHub. Database
migrations are deliberately separate from frontend deployment. After the
GitHub secrets are configured, disable Vercel's native automatic deployment for
`main` immediately before pushing this workflow; otherwise the push can create
an ungated duplicate deployment.

For the local authenticated browser journey, provide a local-only service-role
key and temporary `E2E_TEAM_LEADER_EMAIL` and `E2E_TEAM_LEADER_PASSWORD`, then
run `npm run auth:provision-local`. The provisioning script refuses non-local
Supabase URLs; none of these secrets belongs in application runtime or Git.

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
2. Preview a different Solution publicly, sign in with the privately provided
   Demo Team Leader account, and persist the selection, then inspect its
   recalculated `READY`, `SHORTAGE`, or `UNKNOWN` evidence.
3. On the Work Packages page, choose `Check combined availability`, then select
   `Level 2 service riser firestopping` and `Level 3 east riser firestopping`.
   Their Combined Availability Report exposes shared demand without reserving
   inventory.
4. Open a package marked `SHORTAGE`, select its Blocking Requirements, and add an
   optional note.
5. Preview and copy a deterministic Shortage Summary.
6. Observe that the product says `Copied`, not `Sent`, and retains selectable
   text if clipboard access is unavailable.

Solution selection and its bounded authentication are implemented by PF-004B.
Aggregate Readiness is implemented by PF-004. PF-005 implements the explicit
Combined Availability mode and the copyable single-package and combined
Shortage Summary interactions.

The supporting Product Explorer can be reviewed independently by opening
`/products`, applying a search or evidence filter, then following a Product to
its referencing Work Packages. It does not expand the accepted A2 journey or
claim Product administration, location, reservation, or compliance semantics.

## Data and limitations

- Supabase Postgres is the runtime source of truth and local Supabase is the
  repeatable development/test environment.
- Public reads and Solution previews remain anonymous. A pre-provisioned Demo
  Team Leader account is required for the constrained selected-Solution write.
  It does not reserve inventory or provide production role authorization,
  tenancy, or work ownership.
- A Shortage Summary is transient, user-visible text that can be copied into an
  existing business channel chosen by the user. The application does not store,
  send, assign, or track delivery of it.
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
