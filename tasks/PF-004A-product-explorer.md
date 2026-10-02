# PF-004A: Read-only Product Explorer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use
> `superpowers:executing-plans` to implement this plan task by task. Steps use
> checkbox syntax for progress. Do not commit without separate user approval.

**Goal:** Let a Team Leader find a specific Product, inspect its identity and
latest Inventory evidence, and navigate every Work Package requirement
that references it.

## Usage-table follow-up — 2026-10-03

The approved information hierarchy keeps Product-owned profile attributes in
`Product details` and moves the single latest Inventory Snapshot into `Work
Package usage`, where available quantity can be read beside requirement demand.
The usage tab renders a semantic table with Work Package, requirement, planned
date, and required quantity columns. It does not repeat Product-level inventory
for every requirement row, and it removes the redundant `Requirement evidence`,
`Used in Work Packages`, and Product Requirement count headings.

Acceptance for this follow-up:

- [x] Product details contains no Inventory quantity or captured-time panel.
- [x] Work Package usage shows one explicit known, zero, or unknown latest
      Inventory evidence state above the usage table.
- [x] Every Product Requirement remains a distinct, linked table row.
- [x] The tab label remains the single visible count of unique Work Packages;
      multiple requirements in one Work Package do not inflate it.

### Total-required follow-up — 2026-10-03

The usage summary also shows the informational required quantity across the
listed Product Requirements. Known quantities are summed in the Product's
canonical unit. Requirements with unknown quantities are counted and annotated
beside the known total rather than erasing it or being treated as zero. No usage
rows produce a known zero. This does not calculate remaining stock, readiness,
allocation, reservation, or concurrent scheduling.

- [x] Fully known requirement quantities produce one `Total required` quantity.
- [x] Unknown requirement quantities retain the known sum and produce a
      singular or plural annotation count under `Known required`.
- [x] An unknown-only set displays `Unknown`, never a misleading zero.
- [x] No usage rows produce a known zero total while retaining the no-usage
      state.
- [x] A concise visible note states that this cross-package summary neither
      reserves Inventory nor assumes concurrent work.

**Architecture:** Add a flat `src/modules/product` capability with a pure
filtering service, a narrow repository port, and one Supabase adapter. Next.js
pages validate route/query input and render Product-specific components. Extract
shared UI only where Work Package and Product pages both consume it.

**Tech stack:** Next.js App Router, strict TypeScript, React, Tailwind CSS,
Supabase Postgres, Zod, Vitest, and Testing Library.

**Spec:** [`docs/specs/product-explorer.md`](../docs/specs/product-explorer.md)

- Timebox: 90 minutes
- Depends on: PF-003 and PF-004
- Execution method: native/current session; no subagent or worktree requested
- Git boundary: implementation remains uncommitted until the user explicitly
  authorizes a commit

## Superseding data correction — 2026-10-02

PF-003A removes the cable-pillow Product that was inconsistent with the selected
PVC-conduit Solution. The current Product Explorer therefore contains five
Products, not six. The completed six-Product implementation steps and evidence
below describe the earlier seed and are retained as historical execution
evidence; current verification uses the five-Product source-aligned seed.

## Global constraints

- The capability is public and read-only. Use only the Supabase URL and
  publishable key; add no service-role credential or runtime write.
- Product usage means `Product Requirement -> Work Package`, never physical
  location, formal Solution bill of materials, reservation, or approval.
- Do not add a Solution route, Product CRUD, Product-level readiness, inventory
  administration, pagination, or a generic entity/table framework.
- Product list/detail routes are `/products` and `/products/[id]`; the existing
  Work Package list remains `/`.
- Validate route and query input with Zod. Preserve numeric zero and missing
  evidence as distinct states.
- Keep all hand-written files at or below 500 physical lines and prefer focused
  components.
- Add tests before implementation for every new behavior. Run the focused suite
  after each task and `npm run check` before verification handoff.

## Review focus

- Two requirements for the same Product in one Work Package count as one
  referencing Work Package on the list, while both remain visible on detail.
- Equal Inventory Snapshot timestamps use ID descending as the deterministic
  tie-breaker.
- Numeric zero renders as known Inventory evidence, never `Unknown`.
- Multi-valued or malformed query parameters fall back to the documented safe
  defaults instead of reaching Supabase unchecked.
- A Product with neither usage nor Inventory evidence remains discoverable and
  never implies readiness, shortage, or zero stock.

## Target file map

### Product capability

- `src/modules/product/product-model.ts` — Product identity, snapshot, usage,
  filters, list item, and detail contracts.
- `src/modules/product/product-repository.ts` — `ProductRepository` port.
- `src/modules/product/product-service.ts` — deterministic list filtering,
  unique Work Package count, and detail orchestration.
- `src/modules/product/product-boundaries.ts` — Zod route/query parsing.
- `src/modules/product/supabase-product-repository.ts` — Supabase query and row
  translation.
- `src/modules/product/create-product-service.ts` — server-only composition.
- `src/modules/product/product-list-controls.tsx` — semantic GET search/filter
  form.
- `src/modules/product/product-list.tsx` — result and filtered-empty rendering.
- `src/modules/product/product-detail.tsx` — identity and profile evidence.
- `src/modules/product/product-usage-list.tsx` — latest Inventory evidence and
  reverse Work Package usage table.
- Co-located `*.test.ts` and `*.test.tsx` files protect each responsibility.

### Shared and integration surfaces

- `src/components/app-navigation.tsx` — Work Packages and Products navigation.
- `src/components/page-heading.tsx` — shared list-page heading structure.
- `src/components/empty-state.tsx` — shared empty/no-results container.
- `src/app/layout.tsx` — render shared navigation.
- `src/app/page.tsx` — consume `PageHeading` without moving the `/` route.
- `src/app/products/page.tsx` — validate filters and render Product results.
- `src/app/products/[id]/page.tsx` — validate ID and render Product detail.
- `src/modules/readiness/work-package-list.tsx` — consume shared empty state.
- `src/modules/readiness/work-package-detail.tsx` — link mapped Product name to
  Product detail; retain Product Code as plain adjacent evidence.

## Interfaces

```ts
type ProductUsageFilter = "all" | "used" | "unused";
type ProductInventoryFilter = "all" | "known" | "unknown";

interface ProductListFilters {
  readonly query: string;
  readonly usage: ProductUsageFilter;
  readonly inventory: ProductInventoryFilter;
}

interface ProductIdentity {
  readonly id: string;
  readonly productCode: string;
  readonly name: string;
  readonly canonicalUnit: string;
}

interface ProductProfile {
  readonly category: string;
  readonly manufacturer: string;
  readonly supplierProductCode: string;
  readonly variant: string;
  readonly description: string;
}

interface ProductInventoryEvidence {
  readonly availableQuantity: number;
  readonly capturedAt: string;
}

interface ProductUsageEvidence {
  readonly requirementId: string;
  readonly position: number;
  readonly description: string;
  readonly requiredQuantity: number | null;
  readonly workPackage: {
    readonly id: string;
    readonly name: string;
    readonly plannedDate: string;
  };
}

interface ProductEvidence extends ProductIdentity, ProductProfile {
  readonly inventorySnapshot: ProductInventoryEvidence | null;
  readonly usages: readonly ProductUsageEvidence[];
}

interface ProductListItem extends ProductIdentity {
  readonly inventorySnapshot: ProductInventoryEvidence | null;
  readonly referencingWorkPackageCount: number;
}

interface ProductRepository {
  list(): Promise<readonly ProductEvidence[]>;
  findById(id: string): Promise<ProductEvidence | null>;
}

class ProductService {
  constructor(repository: ProductRepository);
  list(filters: ProductListFilters): Promise<readonly ProductListItem[]>;
  findById(id: string): Promise<ProductEvidence | null>;
}
```

## Task 1: Product model, repository, and filtering service

**Files**

- Create: `src/modules/product/product-model.ts`
- Create: `src/modules/product/product-repository.ts`
- Create: `src/modules/product/product-service.ts`
- Test: `src/modules/product/product-service.test.ts`

**Consumes:** approved Product Explorer filter and usage semantics.

**Produces:** the exact interfaces above plus `ProductService` for the adapter
and pages in later tasks.

- [x] **Step 1: Write the failing service tests**

  Cover Product Code/name search, case-insensitivity, trimmed query, used/unused,
  known/unknown Inventory evidence, combined filters, deterministic Product Code
  ordering, unique Work Package count, duplicate requirements in detail, and an
  absent Product.

- [x] **Step 2: Run the focused test and confirm RED**

  Run: `npm test -- src/modules/product/product-service.test.ts`

  Expected: fail because the Product model/service modules do not exist.

- [x] **Step 3: Implement the minimal model, repository port, and service**

  Keep filtering and unique Work Package counting in the framework-independent
  service. `findById` preserves every requirement usage rather than deduplicating
  it.

- [x] **Step 4: Run the focused test and confirm GREEN**

  Run: `npm test -- src/modules/product/product-service.test.ts`

  Expected: all Product service cases pass with no warnings.

## Task 2: Supabase adapter, boundaries, and composition

**Files**

- Create: `src/modules/product/product-boundaries.ts`
- Create: `src/modules/product/product-boundaries.test.ts`
- Create: `src/modules/product/supabase-product-repository.ts`
- Create: `src/modules/product/supabase-product-repository.test.ts`
- Create: `src/modules/product/create-product-service.ts`
- Modify: `src/modules/readiness/readiness-model.ts`

**Consumes:** `ProductEvidence`, `ProductRepository`, and `ProductService` from
Task 1; current generated Supabase database types.

**Produces:** `parseProductId(value)`, `parseProductListFilters(searchParams)`,
`SupabaseProductRepository`, and server-only `createProductService()`.

- [x] **Step 1: Write failing boundary and row-mapping tests**

  Boundary tests cover valid UUIDs, malformed IDs, valid filters, arrays,
  invalid enums, whitespace-only search, and search values longer than 100
  characters. Adapter tests cover latest snapshot ordering, equal-time ID
  tie-break, numeric zero, missing snapshot, no usages, multiple Work Packages,
  and deterministic usage ordering.

- [x] **Step 2: Run the focused tests and confirm RED**

  Run:
  `npm test -- src/modules/product/product-boundaries.test.ts src/modules/product/supabase-product-repository.test.ts`

  Expected: fail because the boundary and adapter modules do not exist.

- [x] **Step 3: Implement the boundary, adapter, and composition root**

  Use one nested Product query that selects Inventory Snapshots and Product
  Requirements with Work Package identity only. Do not join Solutions. Reuse
  `ProductIdentity` in Readiness evidence so Product identity has one canonical
  TypeScript definition without coupling Product back to Readiness.

- [x] **Step 4: Run focused tests and type checking**

  Run: `npm test -- src/modules/product && npm run typecheck`

  Expected: all Product tests and existing Readiness tests pass; TypeScript
  reports no errors.

## Task 3: Shared UI, Product routes, and bidirectional navigation

**Files**

- Create: `src/components/app-navigation.tsx`
- Create: `src/components/page-heading.tsx`
- Create: `src/components/empty-state.tsx`
- Create: `src/modules/product/product-list-controls.tsx`
- Create: `src/modules/product/product-list.tsx`
- Create: `src/modules/product/product-detail.tsx`
- Create: `src/modules/product/product-usage-list.tsx`
- Create: `src/modules/product/product-components.test.tsx`
- Create: `src/app/products/page.tsx`
- Create: `src/app/products/[id]/page.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/modules/readiness/work-package-list.tsx`
- Modify: `src/modules/readiness/work-package-detail.tsx`
- Modify: `src/modules/readiness/readiness-components.test.tsx`

**Consumes:** Product query and composition interfaces from Tasks 1–2.

**Produces:** accessible `/products` and `/products/[id]` pages, shared
navigation/page-heading/empty-state components, and Product/Work Package links.

- [x] **Step 1: Read the installed Next.js App Router documentation relevant to
      async `searchParams`, route params, links, and not-found handling**

  Record any version-specific constraint in the task evidence before writing
  route code.

- [x] **Step 2: Write failing presentation and integration tests**

  Cover six-result content, Product link targets, GET control names/values,
  filtered-empty reset, known/unknown/zero Inventory evidence, multiple usage
  entries, no-usage state, linked Work Package names, navigation destinations,
  and the single mapped Product-name link from Readiness detail.

- [x] **Step 3: Run presentation tests and confirm RED**

  Run:
  `npm test -- src/modules/product/product-components.test.tsx src/modules/readiness/readiness-components.test.tsx`

  Expected: fail because Product/shared components and Readiness Product links
  do not exist.

- [x] **Step 4: Implement the smallest accessible components and pages**

  Use a semantic GET form with explicit labels, submit/reset actions, visible
  focus, text-based states, and narrow-screen reflow. Keep Product controls
  domain-specific. Extract shared UI only when both Product and Work Package
  pages consume it.

- [x] **Step 5: Run focused tests, lint, and type checking**

  Run: `npm test -- src/modules/product src/modules/readiness && npm run lint && npm run typecheck`

  Expected: Product and Readiness tests pass; lint and TypeScript report no
  errors.

## Task 4: Documentation, runtime proof, and verification handoff

**Files**

- Modify: `AGENTS.md`
- Modify: `README.md`
- Modify: `docs/architecture/overview.md`
- Modify: `docs/product/overview.md`
- Modify: `docs/quality/test-strategy.md`
- Modify: `tasks/BOARD.md`
- Modify: `tasks/PF-004A-product-explorer.md`
- Modify: PF-006 journey only if the Product navigation remains inside its one
  selected browser journey.

**Consumes:** the completed Product runtime and the approved spec.

**Produces:** honest capability status, architecture/data-flow documentation,
verification evidence, and a human-review checklist.

- [x] **Step 1: Update current-state documentation**

  Mark Product Explorer as demonstrated only after working-code evidence exists.
  Keep Solution Explorer, CRUD, physical location, inventory management, and
  Product-level readiness explicitly deferred.

- [x] **Step 2: Run the complete automated gate**

  Run:
  `npm run db:reset && npm run db:test && npm run check && npm audit --audit-level=low && git diff --check`

  Expected: clean database reset; all database and application tests pass;
  formatting, lint, type checking, and production build pass; audit reports no
  known vulnerability; diff check reports no whitespace errors.

- [x] **Step 3: Run production-runtime checks against local Supabase**

  Verify `/products` contains all six Product Codes; search and filters return
  expected subsets; one Product with zero Inventory remains known; one Product
  without a snapshot says `Unknown`; Product detail lists every expected Work
  Package usage; invalid/missing Product IDs show not-found; Work Package detail
  links back to the same Product.

- [x] **Step 4: Review security, modularity, performance, and authored-file size**

  Confirm no write operation, privileged key, Solution query, generic entity
  framework, N+1 Product query, or hand-written file over 500 lines was added.

- [x] **Step 5: Move PF-004A to `Verify` and record human checks**

  Ask the user to verify keyboard-only navigation, focus visibility, clear
  filter labels, filtered-empty recovery, and desktop/narrow-width readability.
  Do not mark `Done` or commit until the remaining human gate and explicit Git
  authorization are received.

## Definition of done

- [x] Product list/detail routes satisfy the approved Product Explorer spec.
- [x] Known Product evidence links between Product and Work Package detail.
- [x] Search and usage/inventory filters are URL-backed and validated.
- [x] Shared UI is extracted only for two concrete consumers; Product-specific
      UI remains in the Product module.
- [x] No Solution route, CRUD behavior, physical-location claim, global Product
      readiness, or formal bill-of-materials claim is introduced.
- [x] Unit, adapter, and presentation tests cover happy, error, and boundary
      cases.
- [x] Feature is validated against reset local Supabase synthetic data.
- [x] The canonical quality gate, database tests, dependency audit, and diff
      checks pass.
- [x] Security, performance, modularity/KISS, reuse, and file size are reviewed.
- [x] Documentation and capability status match observed implementation.
- [ ] Keyboard-only and narrow/mobile behavior receive human sign-off.
- [x] Swagger/OpenAPI is N/A because no HTTP API contract is added.
- [x] MCP is N/A because no MCP capability is added.

## Verification and evidence

- The approved Product Explorer was built test-first across service, boundary,
  Supabase adapter, and presentation layers. Focused RED failures preceded each
  implementation increment.
- Reset local Supabase checks covered discoverability, filters, deterministic
  latest evidence, known zero versus unknown, Product-to-Work-Package links,
  reverse navigation, and invalid or absent Product IDs.
- Shared UI remains limited to breadcrumbs, table structure, and presentation
  formatters with two concrete consumers; Product-specific semantics stay in
  the Product module.
- Rendered desktop and 390-pixel checks covered row navigation, native filter
  arrows, semantic table headings, labelled narrow rows, breadcrumbs, date-only
  formatting, Product profile hierarchy, and horizontal overflow.
- Product usage follow-ups moved Inventory evidence beside demand, added the
  usage table and known-quantity aggregate, and preserved unknown quantities as
  explicit annotations rather than zero.
- Final review corrected unique Work Package counting, incomplete aggregate
  language, unknown-only display, semantic description-list grouping, and the
  visible no-reservation/no-concurrency boundary.
- The final canonical gate, focused Product browser journey, dependency audit,
  diff check, and authored-file size check are rerun immediately before commit.
