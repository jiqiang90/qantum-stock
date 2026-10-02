import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import type {
  WorkPackageListFilters,
  WorkPackageReadiness,
} from "./readiness-model";
import { WorkPackageTable } from "./work-package-table";

export function WorkPackageList({
  items,
  filters,
  totalCount,
}: {
  readonly items: readonly WorkPackageReadiness[];
  readonly filters: WorkPackageListFilters;
  readonly totalCount: number;
}) {
  if (totalCount === 0) {
    return (
      <EmptyState
        title="No Work Packages available"
        description="No planned work can be assessed. This is an empty state, not a READY result."
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="No Work Packages match these filters"
        description="Try a broader search or reset the filters."
        action={
          <Link
            className="inline-flex min-h-11 items-center rounded-md bg-emerald-800 px-4 text-sm font-bold text-white outline-none hover:bg-emerald-900 focus-visible:ring-3 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            href="/"
          >
            Reset filters
          </Link>
        }
      />
    );
  }

  const countLabel =
    items.length === totalCount
      ? `${items.length} Work Package${items.length === 1 ? "" : "s"}`
      : `${items.length} of ${totalCount} Work Packages`;

  return (
    <section aria-labelledby="work-package-list-title">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2
          id="work-package-list-title"
          className="text-xl font-semibold text-slate-950"
        >
          {countLabel}
        </h2>
        <Link
          className="inline-flex min-h-11 items-center self-start rounded-md border border-emerald-800 px-4 text-sm font-bold text-emerald-900 outline-none hover:bg-emerald-50 focus-visible:ring-3 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 sm:self-auto"
          href={buildCombinedHref(filters)}
        >
          Check combined availability
        </Link>
      </div>
      <WorkPackageTable items={items} />
    </section>
  );
}

function buildCombinedHref(filters: WorkPackageListFilters): string {
  const params = new URLSearchParams({ mode: "combined" });

  if (filters.query.length > 0) {
    params.set("q", filters.query);
  }
  if (filters.status !== "all") {
    params.set("status", filters.status);
  }

  return `/?${params.toString()}`;
}
