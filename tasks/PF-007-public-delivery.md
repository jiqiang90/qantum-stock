# PF-007: Public Delivery and Evidence

- Timebox: 60 minutes
- Depends on: PF-006 and explicit authorization for external changes

## Outcome

A reviewer can clone and verify the repository, open the public Vercel URL,
complete A2, and distinguish implementation evidence from Designed-only
capabilities and Production Gaps.

## Files and interfaces

- Finalize README instructions and capability statuses from real evidence.
- Add a Vercel deployment job to the existing GitHub Actions workflow. It runs
  only for `main` after all required verification jobs pass.
- Configure only public Supabase runtime values in Vercel; Vercel deployment
  credentials remain protected GitHub secrets.

The deployment job uses the same checked-out commit that passed the workflow,
builds and deploys it with the Vercel CLI, records URL/revision, and performs a
smoke check. A second `workflow_run` pipeline is unnecessary for this slice.
External resource creation happens only after explicit authorization.

Creating/linking the hosted Supabase and Vercel projects and entering protected
secrets are documented one-time human setup. Migrations and seed remain
versioned, repeatable commands; verification, build, deployment, and smoke checks
remain pipeline behavior.

## Acceptance criteria

- [ ] A clean clone can start local Supabase, run the app, and execute the
      documented checks.
- [ ] Hosted Supabase has the reviewed migration, synthetic seed, and read-only
      public access; public mutations are denied.
- [ ] The `main` deployment job depends on required verification jobs and deploys
      the same workflow revision.
- [ ] No privileged Supabase credential is exposed to source or runtime.
- [ ] The public URL completes the same A2 journey as local Playwright.
- [ ] Repository, CI, deployment, and observed runtime are reported as separate
      evidence.
- [ ] README makes absent identity, recipient, persistence, and delivery proof
      explicit.
- [ ] Public responses use proportionate security headers.
- [ ] The supplied catalogue excerpt remains outside Git history and runtime.

## Execution checklist

- [ ] Run clean local verification and review migrations before external change.
- [ ] After authorization, use the existing GitHub repository, create/link the
      hosted Supabase and Vercel resources, and configure secrets without
      writing them to source.
- [ ] Apply hosted migration/seed and verify read-only public access.
- [ ] Extend the existing workflow with the CI-gated deployment job and verify
      its exact revision.
- [ ] Verify the public journey in a fresh browser session.
- [ ] Audit security headers, ignored materials, Markdown links, Mermaid,
      glossary terms, and the 500-line ceiling.
- [ ] Finalize README, capability statuses, known gaps, and evidence.

## Verification and evidence

Not started. Record clean-install result, CI run, deployed revision, public URL,
runtime verification date, and provider limitations here.
