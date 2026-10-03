# PF-004B: Scenario Solution Selection

- Timebox: 150 minutes
- Depends on: PF-003A and PF-004
- Specification: `docs/specs/solution-selection.md`
- Decision: `docs/architecture/decisions/ADR-005-solution-selection.md`
- Auth decision: `docs/architecture/decisions/ADR-006-demo-authentication-boundary.md`

## Outcome

A Team Leader can compare eligible Solution Options for one Work Package,
preview the resulting Product Requirements and Material Readiness, then persist
one selected Solution through a signed-in Demo Team Leader session without
implying stock reservation. Anonymous visitors retain the complete read and
preview experience.

## Files and interfaces

- Migrate from one fixed Work Package Solution and one requirement set to
  Work-Package-owned Solution Options with option-owned Product Requirements.
- Preserve the existing source-backed Solution rows and synthetic Product,
  mapping, quantity, and inventory boundaries.
- Implement one conflict-aware selection command exposed through a validated
  authenticated route/controller adapter; keep direct runtime table writes
  denied.
- Add request-scoped Supabase Auth, sign-in, sign-out, session-expiry handling,
  and one externally provisioned Demo Team Leader account. Do not add sign-up,
  recovery, profiles, tenancy, or RBAC.
- Extend `ReadinessService` with focused option preview and selection operations;
  keep readiness calculation pure and database translation in the adapter.
- Update Work Package detail with reusable option comparison and selection UI.
- Make list/detail status, Product usage, Aggregate Readiness, and Shortage
  Summary resolve the currently selected option.

## Acceptance criteria

- [ ] SS-1 through SS-13 in the specification pass at their cheapest meaningful
      boundary.
- [x] The seed contains at least two eligible source-backed Solution Options per
      Work Package and deterministic option quantities.
- [x] Anonymous reads and previews remain available; anonymous command execution
      and all direct runtime table writes are denied.
- [x] A signed-in Demo Team Leader can execute only the constrained selection
      command while retaining public read access, sign out, and receives an
      honest authentication failure after session expiry.
- [x] Stale, unrelated, malformed, and repeated selections have the specified
      conflict, validation, and idempotency behaviour.
- [x] Eligible options can be persisted when their recalculated result is
      `SHORTAGE` or `UNKNOWN`; status does not gate the planning choice.
- [x] Existing readiness, Product Explorer, aggregate, and source-row guarantees
      remain intact after the model migration.
- [x] The UI states clearly that selection does not reserve inventory.
- [ ] Option comparison and selection pass keyboard and narrow/mobile review.

## Implementation sequence

### 1. Prove and migrate the option model

- **Files:** a new versioned migration, `supabase/seed.sql`, `supabase/tests/`,
  and generated `src/lib/supabase/database.types.ts`.
- **Action:** write failing pgTAP tests, then add Solution Options,
  option-owned Product Requirements, selected-option integrity, deterministic
  seed data, and the conflict-aware command.
- **Verify:** ownership, eligibility, idempotency, stale conflict, and
  `READY`/`SHORTAGE`/`UNKNOWN` selection cases pass after a clean reset.
- **Done:** the model cannot select an option owned by another Work Package.

### 2. Establish the minimum Auth boundary

- **Files:** `src/lib/supabase/` Auth clients, the Next.js session refresh
  boundary, sign-in/sign-out routes or actions, Auth tests, and dependency files.
- **Action:** add the minimal Supabase SSR dependency and request-scoped cookie
  session. Keep anonymous and authenticated reads equivalent; deny anonymous
  command execution and all direct runtime table mutation.
- **Verify:** tests cover public read, sign-in, session persistence, sign-out,
  expiry, and rejected anonymous writes without exposing credentials.
- **Done:** authentication changes only the ability to call the bounded command.

### 3. Implement preview and selection application behavior

- **Files:** `src/modules/readiness/readiness-service*`, repository port and
  Supabase adapter files, boundaries, and their focused tests.
- **Action:** add option preview and authenticated selection with constructor-
  injected persistence, validated IDs, conflict translation, and no business
  rules in the route adapter.
- **Verify:** service and adapter tests cover success, unrelated option,
  idempotency, expired session, `SHORTAGE`/`UNKNOWN`, and dependency failure.
- **Done:** the service returns the selected option ID or a structured failure;
  the redirected page recalculates readiness from current committed evidence.

### 4. Build the reusable Work Package interaction

- **Files:** `src/app/work-packages/[id]/`, focused components under
  `src/modules/readiness/`, shared styles, and presentation tests.
- **Action:** show eligible options, side-effect-free preview, sign-in gating,
  confirmation, pending/success/error states, conflict recovery, and sign-out.
- **Verify:** component tests plus keyboard and narrow/mobile review cover the
  complete interaction and the no-reservation wording.
- **Done:** anonymous users can finish review/preview; only a valid session can
  persist `Use this Solution`.

### 5. Rewire every selected-option consumer

- **Files:** Work Package list/detail queries, Product usage, Aggregate
  Readiness, Shortage Summary inputs, and their existing tests.
- **Action:** resolve requirements exclusively through each Work Package's
  current selected option without changing readiness rules.
- **Verify:** targeted regression tests prove every view observes one committed
  selection and Aggregate Readiness still counts shared inventory once.
- **Done:** no dependent view reads a stale fixed Solution requirement set.

### 6. Close verification without widening scope

- **Files:** PF-004B evidence below and the selected browser journey under
  `e2e/`.
- **Action:** run clean database reset/tests, focused tests, `npm run check`, and
  the authenticated browser journey; record human keyboard/mobile evidence.
- **Verify:** SS-1 through SS-13 have named evidence and credentials are absent
  from source, logs, screenshots, and public docs.
- **Done:** all automated evidence passes and any human-only evidence or
  deviation remains explicitly open rather than inferred.

## Runtime and credential handling

- Local and hosted reads continue to use the documented public Supabase URL and
  publishable key; no service-role key is added to application runtime.
- Local/CI browser authentication uses `E2E_TEAM_LEADER_EMAIL` and
  `E2E_TEAM_LEADER_PASSWORD` from an ignored local environment file or a masked,
  ephemeral CI step output. These values are setup inputs, never application
  defaults.
- Hosted reviewer credentials are created directly in Supabase Auth and shared
  privately. The public repository and deployed client contain no password.
- Local execution remains `npm run db:start`, `npm run db:reset`, and
  `npm run dev`; the Auth test setup must document any additional provisioning
  command before PF-004B can be marked Done.

## Verification and evidence

### Automated evidence — 2026-10-03

- RED/GREEN application evidence: focused service, repository, boundary, Auth,
  and component tests were written before their implementations. The final
  application gate passes 16 files and 115 tests.
- Database evidence: a clean `npm run db:reset && npm run db:test` passes four
  pgTAP files and 102 tests, including option ownership, mapping invariants,
  role permissions, idempotency, conflict, and `READY`/`SHORTAGE`/`UNKNOWN`
  writes.
- Quality evidence: `npm run check` passes formatting, lint, TypeScript, all
  application tests, and a production Next.js build.
- Browser evidence: five Playwright tests pass, including side-effect-free
  public preview, a 390 px no-overflow check, authenticated sign-in and
  selection, recalculated evidence, sign-out, aggregate readiness, and Product
  detail navigation.
- Security evidence: both production-only and complete `npm audit` checks report
  zero vulnerabilities; source and environment scans found no committed demo
  password or service-role credential.
- Credential/setup evidence: `npm run auth:provision-local` provisions an
  environment-supplied local test account and refuses a non-local Supabase URL.
  The database was reset after browser verification.

### Open human evidence

- Complete the keyboard-only compare, sign-in, select, conflict-recovery, and
  sign-out review. Narrow/mobile layout is automated, but the subjective
  keyboard review remains human-owned under the board working rule.
- Hosted reviewer credentials, CI evidence, and the public URL belong to PF-006
  and PF-007; they are not inferred from successful local checks.

PF-004B therefore remains `Verify`, not `Done`. SS-13 and the combined SS-1 to
SS-13 checkbox stay open until the keyboard review is recorded.
