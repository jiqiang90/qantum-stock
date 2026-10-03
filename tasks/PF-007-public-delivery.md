# PF-007: Public Delivery and Evidence

- Timebox: 60 minutes
- Depends on: documented manual smoke gate and explicit authorization for
  external changes

## Delivery ruling — 2026-10-03

PF-006 automated production-build E2E is deferred. PF-007 retains the existing
GitHub `CI` quality workflow and records manual browser verification separately;
it must not claim automated browser coverage.

Production frontend delivery is controlled by a separate GitHub `Deploy`
workflow. An automatic deployment starts only after `CI` succeeds for a push to
`main`, and it deploys the exact successful `workflow_run.head_sha`. A manual
dispatch checks out its selected revision and reruns `npm run check` before
deployment. Both paths use the protected GitHub `production` Environment.

The workflow calls the Vercel REST API rather than adding the Vercel CLI to the
repository. This keeps deployment under the GitHub quality gate without adding
the CLI's avoidable vulnerable dependency tree. Vercel still owns the cloud
build and runtime configuration. The workflow waits for `READY` and then checks
the Work Package list at `/`; this HTTP smoke check is deployment evidence, not
a substitute for the deferred browser journey.

Vercel's native automatic deployment for `main` must be disabled after the
GitHub secrets are configured and immediately before the first push containing
this workflow. This prevents both duplicate deployments and a first ungated
release. If the GitHub path fails, native deployment can be temporarily
re-enabled while the workflow is corrected.

Hosted Supabase migration and synthetic seed are one-time environment setup for
this fresh demonstration project, not part of every frontend deployment. The
Vercel application receives only `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. GitHub receives no Supabase database or
service-role credential.

## Outcome

A reviewer can clone and verify the repository, open the public Vercel URL,
complete A2, and distinguish implementation evidence from Designed-only
capabilities and Production Gaps.

## Files and interfaces

- `.github/workflows/ci.yml` remains the independent application quality gate.
- `.github/workflows/deploy.yml` owns gated automatic and manual production
  deployment plus the HTTP smoke check.
- `vercel.json` disables Vercel's native automatic deployment for `main` while
  leaving explicit GitHub-controlled deployment available.
- `tests/deploy-workflow.test.ts` protects trigger, revision, secret, permission,
  quality-gate, and smoke-check invariants.
- Vercel contains only public Supabase runtime values.
- GitHub `production` contains `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and
  `VERCEL_PROJECT_ID` as Environment secrets.
- Hosted Demo Team Leader credentials are provisioned in Supabase Auth and
  shared privately with the reviewer. They must not enter Git, Vercel client
  configuration, screenshots, or public documentation.

The deployment request names the connected GitHub repository and exact Git SHA.
The Vercel token is sent only in the API authorization header; workflow output
records the revision and public URL, not secrets or provider responses.

Migrations and seed remain versioned, repeatable setup commands. Database
migration, frontend verification, deployment, and public-runtime checks remain
separate operations and separate evidence.

This demonstration uses a fresh synthetic Supabase project. The current
migration is not a rolling, backward-compatible production upgrade and does not
claim to preserve a separately populated hosted database.

## Acceptance criteria

- [ ] A clean clone can start local Supabase, run the app, and execute the
      documented checks.
- [x] Hosted Supabase has the repository migrations and synthetic seed applied.
- [ ] Hosted Supabase has verified anonymous read, authenticated constrained
      command access, and denied direct table mutation for both runtime roles.
- [ ] Hosted Supabase self-service signup is disabled, and a public signup
      attempt is verified to fail before demo credentials are shared.
- [x] `Deploy` supports manual dispatch and waits for successful `CI` on a
      `main` push before automatic deployment of the same SHA.
- [x] GitHub `production` has the three required Vercel secrets and any desired
      approval protection.
- [ ] Vercel native automatic deployment for `main` is disabled before the first
      workflow-bearing push, so a push can reach production only through the
      gated `Deploy` workflow. An explicit CI or deployment rerun remains an
      operator action for the same recorded SHA.
- [x] One `main` revision has successful `CI`, successful `Deploy`, and a
      successful `/` smoke check.
- [ ] No privileged Supabase credential is exposed to source or runtime.
- [ ] The public URL supports anonymous review and completes the authenticated
      A2 mutation journey with privately supplied demo credentials.
- [x] Repository, CI, deployment, and observed runtime are reported as separate
      evidence.
- [x] README distinguishes bounded demo authentication from absent production
      identity/authorization, recipient, shortage persistence, and delivery
      proof.
- [ ] Public responses use proportionate security headers.
- [ ] The supplied catalogue excerpt remains outside Git history and runtime.

## Execution checklist

- [x] Keep database migration out of the frontend deployment workflow.
- [x] Add and locally test the CI-gated deployment workflow.
- [x] Add versioned Vercel configuration that disables native `main`
      auto-deployment.
- [x] Configure the GitHub `production` Environment and Vercel secrets.
- [ ] Disable Vercel native automatic deployment for `main` immediately before
      pushing the workflow.
- [x] Push the workflow and observe one exact revision through `CI`, `Deploy`,
      Vercel `READY`, and the HTTP smoke check.
- [ ] Provision the Demo Team Leader, test signup denial, and verify hosted
      anonymous read plus authenticated constrained write.
- [ ] Verify the public journey in a fresh browser session.
- [ ] Audit security headers, ignored materials, Markdown links, Mermaid,
      glossary terms, and the 500-line ceiling.
- [ ] Finalize capability statuses, known gaps, and evidence.

## Verification and evidence

Evidence observed on 2026-10-03:

- the public GitHub repository and Vercel Hobby Project `qantum-stock` exist;
- Vercel is connected to the repository, uses the standard Next.js settings,
  and is configured for Node.js 22.x;
- Vercel contains only `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for this application;
- hosted Supabase self-service signup was disabled during provider setup;
- after the Vercel Marketplace account was granted project access, Supabase CLI
  link and migration dry-run succeeded; and
- the user confirmed that the migrations and seed data are visible in hosted
  Supabase;
- commit `d0db48a` passed GitHub `CI` run `37079806664` and GitHub `Deploy` run
  `37079887963`;
- the public production alias is
  [`https://qantum-stock.vercel.app/`](https://qantum-stock.vercel.app/); and
- anonymous Work Package list, Work Package detail, and Combined Availability
  rendering were observed against the public production alias while preparing
  the repository screenshots.

Local implementation evidence:

- deployment-workflow contract tests cover manual and `workflow_run` triggers,
  push-to-`main` hardening, exact-SHA checkout, manual quality ordering,
  read-only repository permission, production Environment isolation, the three
  Vercel secrets, absence of privileged Supabase secrets, and smoke checking;
- the Vercel CLI was rejected as a project dependency after audit findings; the
  REST approach leaves the project dependency audit clean.

The authenticated hosted mutation journey and the complete manual accessibility
review remain unverified. Automated production-build browser E2E remains
deferred under PF-006.
