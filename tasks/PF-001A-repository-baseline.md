# PF-001A: Repository and Remote Baseline

- Timebox: 15 minutes plus the first GitHub Actions run
- Depends on: PF-001 and human authorization for Git/GitHub changes

## Outcome

The project has a clean, reviewable local and GitHub baseline before business
code is introduced.

The confirmed remote is:

```text
https://github.com/jiqiang90/qantum-stock.git
```

A read-only check on 2026-10-02 found no remote `HEAD`, branches, or tags. The
human must recheck before the first push rather than assuming it remains empty.

## Human implementation guide

- Review `.gitignore` before staging anything.
- Confirm the supplied DOCX, translated notes, CSV, environment files,
  dependencies, build output, coverage, IDE state, and Vercel state remain
  ignored.
- Initialize Git, review the complete staged file list, and make the initial
  commit only when satisfied with the boundary.
- Recheck the remote for unexpected history. Stop rather than force-pushing if
  any branch or tag has appeared.
- Set the remote as `origin` and push local `main` without force.
- Observe the baseline GitHub Actions run triggered by the first push and record
  its real result separately from local verification.
- Do not configure Supabase, Vercel, or deployment secrets in this task.

## Acceptance criteria

- [ ] `git status --short` contains only intended foundation, source,
      documentation, and task files before commit.
- [ ] No supplied/private reference material, secret, generated output, or local
      tool state is staged.
- [ ] The initial commit has an intentional message and a reviewed file boundary.
- [ ] `origin` resolves exactly to the confirmed repository URL.
- [ ] Local `main` and `origin/main` point to the same initial commit after a
      non-forced push.
- [ ] The working tree is clean after the push.
- [ ] The first GitHub Actions run is recorded as passed or failed from observed
      GitHub evidence; workflow configuration is not treated as a passing run.

## Execution boundary

AI may initialize Git, inspect ignored/staged files, run automated checks,
commit, set the confirmed remote, push without force, and inspect CI after the
human explicitly starts this task. The human handles any interactive GitHub
login or approval prompt and confirms any concern that requires subjective
judgment. Neither party configures Supabase, Vercel, or deployment secrets in
this task.

## Verification and evidence

Not started. Record the commit SHA, remote URL, reviewed `git status`, push
result, and GitHub Actions run URL here.
