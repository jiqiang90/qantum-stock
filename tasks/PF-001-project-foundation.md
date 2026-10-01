# PF-001: Project Foundation

- Completed: 2026-10-01
- Depends on: None

## Outcome

Developers and coding agents can install, run, check, test, and build the same
minimal Next.js application using documented commands and locked dependencies.

## Scope

- Next.js App Router, React, strict TypeScript, and Tailwind CSS.
- ESLint and Prettier configuration.
- Vitest, Testing Library, coverage configuration, and one scaffold test.
- Playwright configuration reserved for the first real browser journey.
- Supabase and Zod runtime dependencies.
- A baseline GitHub Actions workflow that runs the local quality gate.
- A tested Node and npm toolchain recorded for clean-clone reproducibility.
- Root agent instructions and environment-variable template.

Business readiness, Supabase data, summary behavior, database/browser CI stages,
and deployment are not part of this foundation item.

## Acceptance criteria

- [x] A clean dependency install has no reported package vulnerabilities.
- [x] Formatting, lint, typecheck, scaffold test, and production build pass.
- [x] The development server responds successfully at the local root route.
- [x] The declared Node range matches the installed test toolchain, and the
      tested version is recorded in `.nvmrc`.
- [x] Baseline CI is configured for a clean install and the same local quality
      gate; its commands pass locally without claiming a remote run.
- [x] No Git repository or cloud resource is created or mutated.

## Implementation checklist

- [x] Create the Next.js application entry point and base styling.
- [x] Configure strict TypeScript, ESLint, and Prettier.
- [x] Configure Vitest, Testing Library, coverage, and Playwright.
- [x] Add the scaffold component test.
- [x] Install dependencies and create the npm lock file.
- [x] Record the tested Node/npm toolchain and add baseline CI.
- [x] Add local commands and agent guardrails.

## Verification

| Date       | Check                               | Result                                                        |
| ---------- | ----------------------------------- | ------------------------------------------------------------- |
| 2026-10-01 | `npm ci`                            | Passed; clean install completed                               |
| 2026-10-01 | `npm run check`                     | Passed: format, lint, typecheck, 1 test, and production build |
| 2026-10-01 | Start `npm run dev` and request `/` | Passed: HTTP 200                                              |
| 2026-10-01 | Authored-file line-count audit      | Passed: every included file is at or below 500 physical lines |

## Decisions and deviations

- ESLint 10 was rejected after the Next.js plugin chain reported incompatible
  peer ranges. The compatible ESLint 9 release is pinned until that ecosystem
  supports the newer major.
- `jsdom` 29 and Vitest 5 have overlapping support on Node 22.13 or newer but
  not across every later odd-numbered Node release. The project therefore uses
  Node 22.22.0 and declares only the compatible Node 22 range.
- Playwright is configured but no browser journey is claimed until PF-006 has a
  complete user journey to test.
- The baseline workflow is verified by reproducing its commands locally. No
  remote GitHub run is claimed before a repository exists.
