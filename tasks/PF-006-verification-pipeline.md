# PF-006: Selected Journey and CI Pipeline

- Timebox: 60 minutes
- Depends on: PF-003 and PF-005

## Outcome

One reproducible command and one GitHub Actions pipeline prove the accepted A2
First Slice.

## Files and interfaces

- Create `e2e/shortage-summary.spec.ts` for the accepted journey.
- Adjust Playwright for deterministic local database use and a production-mode
  Next.js server after `npm run build`.
- Add `verify` only after every included command exists; document whether the
  human must start Supabase first or the command owns start/reset/cleanup.
- Extend CI to start/reset Supabase, run database and application checks, build,
  and run Playwright.
- Install the Playwright Chromium browser and required OS dependencies in CI.
- Increase the workflow timeout from the 10-minute foundation value to a
  measured value, initially capped at 20 minutes.
- Upload Playwright traces, screenshots, and reports only on failure.

The journey is: list -> shortage Work Package -> evidence -> select blocker ->
add note -> preview -> copy. The clipboard is controlled deterministically.

## Acceptance criteria

- [ ] The First Slice journey passes against a clean local reset.
- [ ] CI performs clean install, format, lint, typecheck, unit/integration tests,
      database tests, production build, and the browser journey.
- [ ] Playwright screenshots/traces are retained on failure.
- [ ] CI installs the pinned Chromium browser required by Playwright.
- [ ] The browser journey runs against the production build, not `next dev`.
- [ ] The local and CI database lifecycle is explicit and leaves no hidden test
      state between runs.
- [ ] `npm run verify` names only checks that exist and pass locally.
- [ ] The browser assertion distinguishes copied text from sent content.
- [ ] CI success is not described as deployment or public-runtime evidence.

## Human implementation guide

- [ ] Write the browser journey and run it from a clean reset.
- [ ] Configure Playwright to build/start the production application for the
      delivery journey and grant or stub clipboard access deterministically.
- [ ] Add only deterministic seed references or test hooks required by the
      journey.
- [ ] Run the journey twice from clean resets to detect leaked state.
- [ ] Extend CI with Supabase lifecycle, Playwright installation, failure
      artifact upload, and a measured timeout; reproduce every command locally.
- [ ] Add `verify`, run it, and record evidence below.

## Verification and evidence

Not started. Record date, local result, and later the authorized GitHub run URL.
