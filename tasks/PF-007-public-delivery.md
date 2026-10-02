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
- Pre-provision the hosted Demo Team Leader in Supabase Auth and share its
  credentials privately with the reviewer. Do not store credentials in Git,
  Vercel client configuration, seed SQL, screenshots, or public documentation.

The deployment job uses the same checked-out commit that passed the workflow,
builds and deploys it with the Vercel CLI, records URL/revision, and performs a
smoke check. A second `workflow_run` pipeline is unnecessary for this slice.
External resource creation happens only after explicit authorization.

Creating/linking the hosted Supabase and Vercel projects and entering protected
secrets are documented one-time human setup. Migrations and seed remain
versioned, repeatable commands; verification, build, deployment, and smoke checks
remain pipeline behavior.

This demonstration is deployed to a fresh synthetic Supabase project. The
current migration is not a rolling, backward-compatible production upgrade and
does not claim to preserve a separately populated hosted database.

## Acceptance criteria

- [ ] A clean clone can start local Supabase, run the app, and execute the
      documented checks.
- [ ] Hosted Supabase has the reviewed migration, synthetic seed, anonymous read
      access, authenticated constrained-command access, and denied direct table
      mutation for both runtime roles.
- [ ] Hosted Supabase self-service signup is disabled, and a public signup
      attempt is verified to fail before the demo credentials are shared.
- [ ] The `main` deployment job depends on required verification jobs and deploys
      the same workflow revision.
- [ ] No privileged Supabase credential is exposed to source or runtime.
- [ ] The public URL supports anonymous review and completes the same
      authenticated A2 mutation journey when private demo credentials are used.
- [ ] Repository, CI, deployment, and observed runtime are reported as separate
      evidence.
- [ ] README distinguishes bounded demo authentication from absent production
      identity/authorization, recipient, shortage persistence, and delivery
      proof.
- [ ] Public responses use proportionate security headers.
- [ ] The supplied catalogue excerpt remains outside Git history and runtime.

## Execution checklist

- [ ] Run clean local verification and review migrations before external change.
- [ ] After authorization, use the existing GitHub repository, create/link the
      hosted Supabase and Vercel resources, and configure secrets without
      writing them to source.
- [ ] Apply hosted migration/seed, provision the Demo Team Leader outside Git,
      disable and test every hosted self-service signup path, and verify
      anonymous read plus authenticated constrained write.
- [ ] Extend the existing workflow with the CI-gated deployment job and verify
      its exact revision.
- [ ] Verify the public journey in a fresh browser session.
- [ ] Audit security headers, ignored materials, Markdown links, Mermaid,
      glossary terms, and the 500-line ceiling.
- [ ] Finalize README, capability statuses, known gaps, and evidence.

## Verification and evidence

Not started. Record clean-install result, CI run, deployed revision, public URL,
runtime verification date, and provider limitations here.
