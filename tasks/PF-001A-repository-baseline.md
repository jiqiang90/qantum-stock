# PF-001A: Repository and Remote Baseline

- Timebox: 15 minutes plus the first GitHub Actions run
- Depends on: PF-001 and human authorization for Git/GitHub changes

## Outcome

The project has a clean, reviewable local and GitHub baseline before business
code is introduced.

The confirmed GitHub repository is:

```text
https://github.com/jiqiang90/qantum-stock.git
```

A read-only check on 2026-10-02 found no remote `HEAD`, branches, or tags before
the first push. The repository-local `origin` uses the equivalent SSH URL because
the available `jiqiang90` GitHub authentication is configured for SSH.

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

- [x] `git status --short` contains only intended foundation, source,
      documentation, and task files before commit.
- [x] No supplied/private reference material, secret, generated output, or local
      tool state is staged.
- [x] The initial commit has an intentional message and a reviewed file boundary.
- [x] `origin` resolves to the confirmed repository identity over SSH.
- [x] Local `main` and `origin/main` point to the same current commit after a
      non-forced push.
- [x] The working tree is clean after the verified push.
- [x] The first GitHub Actions run is recorded as passed or failed from observed
      GitHub evidence; workflow configuration is not treated as a passing run.

## Execution boundary

AI may initialize Git, inspect ignored/staged files, run automated checks,
commit, set the confirmed remote, push without force, and inspect CI after the
human explicitly starts this task. The human handles any interactive GitHub
login or approval prompt and confirms any concern that requires subjective
judgment. Neither party configures Supabase, Vercel, or deployment secrets in
this task.

## Verification and evidence

| Date       | Evidence                       | Result                                                                                         |
| ---------- | ------------------------------ | ---------------------------------------------------------------------------------------------- |
| 2026-10-02 | Ignore and staged-file review  | Passed; supplied files, secrets, generated output, IDE state, and Word lock file were excluded |
| 2026-10-02 | `npm run check`                | Passed: format, lint, typecheck, scaffold test, and production build                           |
| 2026-10-02 | `npm audit --audit-level=high` | Passed; 0 vulnerabilities                                                                      |
| 2026-10-02 | Initial commit                 | `c5e009d` — `chore: establish project foundation`                                              |
| 2026-10-02 | First HTTPS push               | Rejected with 403 because the HTTPS credential helper selected unrelated account `jayjispotto` |
| 2026-10-02 | Repository-local SSH origin    | `git@github.com:jiqiang90/qantum-stock.git`; read access verified before non-forced push       |
| 2026-10-02 | First GitHub Actions run       | Passed: `https://github.com/jiqiang90/qantum-stock/actions/runs/36859967761`                   |
| 2026-10-02 | CI runtime correction          | `8a7d87f`; pinned Ubuntu 24.04 and upgraded official checkout/setup-node actions to v7         |
| 2026-10-02 | Corrected GitHub Actions run   | Passed: `https://github.com/jiqiang90/qantum-stock/actions/runs/36860152089`                   |

## Decisions and deviations

- The initial HTTPS push failure did not change remote history. The repo-local
  origin was switched to SSH rather than changing global credentials or using
  force.
- The first CI run passed but warned that v4 actions used the deprecated Node 20
  runtime and that `ubuntu-latest` would migrate. The workflow was corrected and
  a second observed run passed without those annotations.
