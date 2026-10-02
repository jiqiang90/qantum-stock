import Link from "next/link";

import type {
  WorkPackageListFilters,
  WorkPackageReadiness,
} from "./readiness-model";
import { WorkPackageTable } from "./work-package-table";

export function CombinedAvailabilitySelector({
  items,
  filters,
  totalCount,
  selectedIds,
  selectionAttempted,
}: {
  readonly items: readonly WorkPackageReadiness[];
  readonly filters: WorkPackageListFilters;
  readonly totalCount: number;
  readonly selectedIds: readonly string[];
  readonly selectionAttempted: boolean;
}) {
  const visibleIds = new Set(items.map(({ workPackage }) => workPackage.id));
  const visibleSelectedIds = selectedIds.filter((id) => visibleIds.has(id));
  const countLabel =
    items.length === totalCount
      ? `${items.length} Work Package${items.length === 1 ? "" : "s"}`
      : `${items.length} of ${totalCount} Work Packages`;

  return (
    <section aria-labelledby="combined-availability-title">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-emerald-800 uppercase">
            Combined availability
          </p>
          <h2
            id="combined-availability-title"
            className="mt-1 text-xl font-semibold text-slate-950"
          >
            Select Work Packages
          </h2>
          <p
            id="selection-help"
            className="mt-2 max-w-3xl text-sm text-slate-600"
          >
            Select at least two packages to compare their combined demand with
            shared Inventory evidence.
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center self-start rounded-md px-3 text-sm font-semibold text-emerald-900 underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 sm:self-auto"
          href={buildBrowseHref(filters)}
        >
          Exit combined availability
        </Link>
      </div>

      <p className="mb-4 text-sm font-semibold text-slate-700">{countLabel}</p>

      <form action="/" method="get" aria-label="Check combined availability">
        <input name="mode" type="hidden" value="combined" />
        <input name="compare" type="hidden" value="1" />
        {filters.query.length > 0 ? (
          <input name="q" type="hidden" value={filters.query} />
        ) : null}
        {filters.status === "all" ? null : (
          <input name="status" type="hidden" value={filters.status} />
        )}
        <fieldset aria-describedby="selection-help" className="min-w-0">
          <legend className="sr-only">Select Work Packages to compare</legend>
          <WorkPackageTable items={items} selectedIds={visibleSelectedIds} />

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              id="check-combined-availability"
              className="min-h-11 rounded-md bg-emerald-800 px-5 text-sm font-bold text-white outline-none hover:bg-emerald-900 focus-visible:ring-3 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              type="submit"
            >
              Check availability
            </button>
          </div>
          {selectionAttempted && visibleSelectedIds.length < 2 ? (
            <p
              className="mt-3 text-sm font-semibold text-rose-800"
              role="alert"
            >
              Select at least two Work Packages to check combined demand.
            </p>
          ) : null}
        </fieldset>
      </form>
    </section>
  );
}

function buildBrowseHref(filters: WorkPackageListFilters): string {
  const params = new URLSearchParams();

  if (filters.query.length > 0) {
    params.set("q", filters.query);
  }
  if (filters.status !== "all") {
    params.set("status", filters.status);
  }

  const query = params.toString();
  return query.length === 0 ? "/" : `/?${query}`;
}
