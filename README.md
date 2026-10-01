# Passivefire Material Readiness

This project explores a focused Team Leader journey for QAntum: understand
whether a planned passive-fire Work Package has the required materials and, when
it does not, prepare a clear Shortage Summary that can be copied into an existing
business communication channel before travelling to site.

## Current status

The application foundation, local quality tooling, baseline GitHub Actions run,
framework-independent Material Readiness calculation, and reproducible local
Supabase schema are verified. Product, architecture, data-flow, testing, and
execution documents are ready for review; the user-facing journey,
database/browser CI stages, and public deployment are not yet implemented.

## Quick start

Use Node.js 22.22.0 (the version recorded in `.nvmrc`) and npm 10.9.4. If nvm is
available, select the recorded Node version first.

```bash
nvm use # optional when nvm is installed
npm ci
npm run dev
```

Open `http://localhost:3000`.

Local database development also requires Docker. Recreate the read-only Sample
Data model from its migration and seed with:

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
```

Run `npm run check` for the complete local quality gate. Playwright is configured,
but a browser test is not claimed until a real journey exists.

Copy `.env.example` to `.env.local` when the Supabase-backed UI is introduced.
Only the public Supabase URL and publishable key belong there; no service-role
credential is required by the application.

## Reviewer guide

The shortest review path is Product Overview -> First Slice Specification ->
Technical Design -> Test Strategy -> Agent-assisted Approach.

| Document                                                                   | Purpose                                                                         |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [`docs/product/overview.md`](docs/product/overview.md)                     | Business context, evidence gaps, wider workflow, roadmap, and capability status |
| [`docs/specs/material-readiness.md`](docs/specs/material-readiness.md)     | First Slice assumptions, requirements, acceptance criteria, and exclusions      |
| [`docs/architecture/overview.md`](docs/architecture/overview.md)           | First Slice boundaries, read flow, data model, and security invariants          |
| [`docs/quality/test-strategy.md`](docs/quality/test-strategy.md)           | Risk-based test coverage and delivery quality gate                              |
| [`docs/engineering/agent-approach.md`](docs/engineering/agent-approach.md) | How coding agents are guided, challenged, corrected, and verified               |

[`docs/README.md`](docs/README.md) maps authority boundaries. The glossary,
ADRs, `AGENTS.md`, and `tasks/` are supporting definitions, agent instructions,
decisions, and execution evidence.

## Planned demo scenario

1. Open the Work Package list and select a package marked `SHORTAGE`.
2. Inspect the material evidence behind its Material Readiness.
3. Select the Blocking Requirements and add an optional note.
4. Preview and copy a deterministic Shortage Summary.
5. Observe that the product says `Copied`, not `Sent`, and retains selectable
   text if clipboard access is unavailable.

This scenario is delivered incrementally by PF-002 through PF-006; it is not yet
implemented.

## Data and limitations

- Supabase Postgres is the runtime source of truth and local Supabase is the
  repeatable development/test environment.
- The First Slice is read-only. It does not authenticate a Team Leader, persist
  a report, notify a recipient, assign an owner, or track resolution.
- The copied Shortage Summary is intended for an existing business channel; the
  user decides where to paste it.
- The supplied exercise brief and `data/solutions-excerpt.csv` catalogue are
  ignored local reference material. They are not committed, redistributed, or
  required to run the public repository.
- Reproducible demo seeds use independently authored synthetic records under a
  global `Sample Data` notice.

The brief says the catalogue includes required products, but the received CSV
contains no Product identifier, Product name, SKU, or Solution-to-Product
mapping. Its internal and supplier reference codes identify Solutions.
Therefore the demo uses synthetic Solutions, Products, Product Requirements,
quantities, inventory, and Work Packages. A readiness result is not evidence
that a passive-fire Solution or alternative has received compliance approval.
