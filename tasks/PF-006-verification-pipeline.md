# PF-006: Selected Journey and CI Pipeline

- Timebox: 60 minutes
- Status: Verify
- Depends on: PF-003 and PF-005

## Resumption decision — 2026-10-03

The earlier timebox deferral was superseded when the user asked to strengthen
coverage and fix the CI verification gap. The deterministic Playwright journeys
and clean local-Supabase lifecycle are now part of GitHub `CI`. Configuration,
a successful local run, a successful remote CI run, deployment, and public
runtime evidence remain separate claims.

## Outcome

The documented local command sequence and GitHub Actions pipeline prove the
accepted A2 First Slice across database permissions, authored source coverage,
the production build, and browser-visible journeys.

## Files and interfaces

- `e2e/aggregate-readiness.spec.ts`, `e2e/shortage-summary.spec.ts`,
  `e2e/product-section-navigation.spec.ts`, and
  `e2e/solution-selection.spec.ts` cover the accepted browser journeys.
- `playwright.config.ts` accepts `PLAYWRIGHT_WEB_SERVER_COMMAND`; CI supplies
  `npm run start` so journeys run against the already-built production server.
- `scripts/provision-local-demo-user.mjs` provisions only a localhost Supabase
  user. CI generates and masks an ephemeral random password for its disposable
  local stack; the application and logs do not receive or print the password.
- `.github/workflows/ci.yml` starts Supabase, exports its local runtime values,
  resets/tests/lints the database, provisions the test actor, runs the quality
  gate, installs Chromium, runs Playwright, uploads failure evidence, and always
  stops Supabase.
- `npm run check` measures coverage across authored production `src` files and
  enforces the configured 80% statement, branch, function, and line thresholds.

The automated journeys jointly cover public reads, anonymous preview without
persistence, authenticated Solution selection, recalculated evidence, combined
availability, copy-only Shortage Summaries, responsive access, and sign-out.
Database and application tests retain the lower-level anonymous-write denial and
direct-table-mutation evidence.

## Acceptance criteria

- [x] The First Slice journeys pass against a clean local reset in the final
      verification run recorded below.
- [x] CI is configured for clean install, format, lint, typecheck, full-source
      coverage, database reset/tests/lint, production build, and browser
      journeys.
- [x] Playwright screenshots and traces are retained on failure.
- [x] CI installs Chromium and its required OS dependencies.
- [x] CI browser journeys run against `next start`, not `next dev`.
- [x] The CI database lifecycle is explicit and always stops its local stack.
- [x] The authenticated journey restores its original Solution selection and
      runs serially with other journeys that share the seeded database.
- [x] The documented local sequence names only repository commands that exist.
- [x] Browser assertions distinguish copied text from sent content.
- [x] The combined browser/database evidence proves public read,
      authenticated write, and read-only behavior after sign-out without
      printing credentials.
- [x] CI success is not described as deployment or public-runtime evidence.
- [ ] A successful remote GitHub CI run is linked after these changes are
      committed and pushed by an authorized delivery step.

## Execution checklist

- [x] Implement deterministic browser journeys for the accepted slice.
- [x] Configure CI Playwright to start the production application and control
      clipboard access deterministically.
- [x] Reuse deterministic seed references without adding production test hooks.
- [x] Provision the test Auth account outside public seed tables and pass its
      local-only credentials through environment variables.
- [x] Run the complete journey from a clean reset and record the fresh result.
- [x] Extend CI with the Supabase lifecycle, Playwright installation, failure
      artifacts, a 20-minute timeout, and unconditional cleanup.
- [ ] Observe and link the authorized remote CI run.

## Verification and evidence

Fresh local evidence from 2026-10-03:

- `npm run db:reset && npm run db:test && npx supabase db lint --local --level warning`
  passed 107 pgTAP assertions across four files with no schema lint errors.
- `npm run check` passed formatting, ESLint, TypeScript, 27 Vitest files / 170
  tests, all four 80% coverage thresholds (82.10% statements, 80.94% branches,
  87.73% functions, 82.13% lines), and the production Next.js build.
- The localhost-only actor was provisioned after the clean reset, then
  `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 PLAYWRIGHT_WEB_SERVER_COMMAND="npm run start -- -p 3100" npm run test:e2e`
  passed all eight Chromium journeys against the production server while the
  existing development server on port 3000 was preserved. Re-running the
  Product evidence journey afterwards also passed, proving the authenticated
  journey restored its shared seed state.
- The CI/deployment contract suite is included in the 170 passing tests and
  verifies the database/coverage/browser gate, 20-minute timeout, production
  server command, failure evidence, and cleanup steps.

A remote GitHub run cannot exist until an authorized commit/push and is
intentionally not inferred from the workflow file.
