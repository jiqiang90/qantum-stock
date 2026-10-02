import Link from "next/link";

import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { formatPlannedDate, ReadinessStatusBadge } from "./readiness-display";
import { formatSolutionLabel } from "./solution-display";
import type {
  WorkPackageListFilters,
  WorkPackageReadiness,
} from "./readiness-model";

export function WorkPackageList({
  items,
  filters,
  totalCount,
  selectedIds = [],
  selectionAttempted = false,
}: {
  readonly items: readonly WorkPackageReadiness[];
  readonly filters: WorkPackageListFilters;
  readonly totalCount: number;
  readonly selectedIds?: readonly string[];
  readonly selectionAttempted?: boolean;
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

  const selected = new Set(selectedIds);
  const listHref = buildWorkPackageListHref(filters);
  const countLabel =
    items.length === totalCount
      ? `${items.length} Work Package${items.length === 1 ? "" : "s"}`
      : `${items.length} of ${totalCount} Work Packages`;

  return (
    <section aria-labelledby="work-package-list-title">
      <h2
        id="work-package-list-title"
        className="mb-4 text-xl font-semibold text-slate-950"
      >
        {countLabel}
      </h2>
      <p id="selection-help" className="mb-4 max-w-3xl text-sm text-slate-600">
        Individual status considers each package on its own. Select at least two
        packages to check their combined demand against shared Inventory
        evidence.
      </p>

      <form action="/" method="get" aria-label="Compare Work Packages">
        <input name="compare" type="hidden" value="1" />
        {filters.query.length > 0 ? (
          <input name="q" type="hidden" value={filters.query} />
        ) : null}
        {filters.status === "all" ? null : (
          <input name="status" type="hidden" value={filters.status} />
        )}
        <fieldset aria-describedby="selection-help" className="min-w-0">
          <legend className="sr-only">Select Work Packages to compare</legend>
          <DataTable label="Work Packages">
            <colgroup className="hidden lg:table-column-group">
              <col className="w-[9%]" />
              <col className="w-[14%]" />
              <col className="w-[27%]" />
              <col className="w-[36%]" />
              <col className="w-[14%]" />
            </colgroup>
            <DataTableHead>
              <DataTableHeaderCell>Compare</DataTableHeaderCell>
              <DataTableHeaderCell>Planned</DataTableHeaderCell>
              <DataTableHeaderCell>Work Package</DataTableHeaderCell>
              <DataTableHeaderCell>Solution</DataTableHeaderCell>
              <DataTableHeaderCell>Status</DataTableHeaderCell>
            </DataTableHead>
            <DataTableBody>
              {items.map(({ workPackage, selectedOption, assessment }) => (
                <DataTableRow key={workPackage.id}>
                  <DataTableCell label="Compare">
                    <input
                      aria-label={`Select ${workPackage.name}`}
                      className="relative z-10 size-6 accent-emerald-800 outline-none focus-visible:ring-3 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
                      defaultChecked={selected.has(workPackage.id)}
                      name="workPackage"
                      type="checkbox"
                      value={workPackage.id}
                    />
                  </DataTableCell>
                  <DataTableCell label="Planned">
                    {formatPlannedDate(workPackage.plannedDate)}
                  </DataTableCell>
                  <DataTableCell label="Work Package" emphasis>
                    <Link
                      href={`/work-packages/${workPackage.id}`}
                      className="rounded-sm text-base font-semibold text-slate-950 outline-none group-hover:text-emerald-900 after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-3 focus-visible:after:ring-emerald-700 focus-visible:after:ring-inset"
                    >
                      {workPackage.name}
                    </Link>
                  </DataTableCell>
                  <DataTableCell label="Solution">
                    {formatSolutionLabel(selectedOption.solution)}
                  </DataTableCell>
                  <DataTableCell label="Status">
                    <ReadinessStatusBadge status={assessment.status} />
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              className="min-h-11 rounded-md bg-emerald-800 px-5 text-sm font-bold text-white outline-none hover:bg-emerald-900 focus-visible:ring-3 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              type="submit"
            >
              Check selected packages
            </button>
            <Link
              className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold text-emerald-900 underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
              href={listHref}
            >
              Clear selection
            </Link>
          </div>
          {selectionAttempted && selected.size < 2 ? (
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

function buildWorkPackageListHref(filters: WorkPackageListFilters): string {
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
